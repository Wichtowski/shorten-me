import os
import sys
import subprocess
import pathlib
import dotenv
import time
import urllib.request
# Get environment from command line argument or default to development
ENVIRONMENT = sys.argv[1] if len(sys.argv) > 1 else "development"
print(f"Deploying to {ENVIRONMENT} environment")

dotenv.load_dotenv()

PULUMI_CONFIG_PASSPHRASE = os.getenv(f"PULUMI_CONFIG_PASSPHRASE_{ENVIRONMENT.upper()}") or os.getenv("PULUMI_CONFIG_PASSPHRASE")
cosmosdb_key = os.getenv("COSMOSDB_KEY") or os.getenv(f"COSMOSDB_KEY_{ENVIRONMENT.upper()}")

def get_pulumi_output(output_name):
    try:
        env = os.environ.copy()
        env["PULUMI_CONFIG_PASSPHRASE"] = PULUMI_CONFIG_PASSPHRASE
        result = subprocess.run(
            ["pulumi", "stack", "output", output_name, "--show-secrets"],
            capture_output=True,
            text=True,
            cwd=INFRA_DIR,
            env=env
        )
        if result.returncode == 0 and result.stdout:
            return result.stdout.strip()
        print(f"Pulumi output for {output_name} not found or empty.")
        print(result.stdout)
        return None
    except Exception as e:
        print(f"Error getting Pulumi output {output_name}: {e}")
        return None

INFRA_DIR = pathlib.Path(__file__).parent.absolute()
PROJECT_ROOT = INFRA_DIR.parent

cosmosdb_endpoint = os.getenv("COSMOSDB_ENDPOINT") or get_pulumi_output('cosmosdb_endpoint') or os.getenv(f"COSMOSDB_ENDPOINT_{ENVIRONMENT.upper()}")
cosmosdb_database_name = f'urlshortener-{ENVIRONMENT.lower()}'

if cosmosdb_endpoint is None:
    cosmosdb_endpoint = os.getenv("COSMOSDB_ENDPOINT")

if not all([cosmosdb_endpoint, cosmosdb_key, cosmosdb_database_name]):
    print("Error: Missing required CosmosDB configuration")
    print(f"  PULUMI_CONFIG_PASSPHRASE: {PULUMI_CONFIG_PASSPHRASE}")
    print(f"  cosmosdb_endpoint: {cosmosdb_endpoint}")
    print(f"  cosmosdb_key: {cosmosdb_key}")
    print(f"  cosmosdb_database_name: {cosmosdb_database_name}")
    sys.exit(1)

print("Getting container registry information...")
registry_login_server = get_pulumi_output("container_registry_login_server")
registry_username = get_pulumi_output("container_registry_username")
registry_password = get_pulumi_output("container_registry_password")

app_name = get_pulumi_output("frontend_app_name")
resource_group = get_pulumi_output("resource_group_name")

if not all([registry_login_server, registry_username, registry_password, app_name, resource_group]):
    print("Failed to get required info from Pulumi outputs.\nPulumi outputs:")
    print(f"  container_registry_login_server: {registry_login_server}")
    print(f"  container_registry_username: {registry_username}")
    print(f"  container_registry_password: {registry_password}")
    print(f"  frontend_app_name: {app_name}")
    print(f"  resource_group_name: {resource_group}")
    sys.exit(1)

print(f"Logging in to container registry {registry_login_server}...")
try:
    subprocess.run(
        ["docker", "login", registry_login_server, "-u", registry_username, "-p", registry_password],
        check=True,
        cwd=PROJECT_ROOT
    )
except subprocess.CalledProcessError as e:
    print(f"Failed to log in to container registry: {e}")
    sys.exit(1)

frontend_image_name = f"{registry_login_server}/shortenme-frontend:latest"
print("Building frontend container...")
try:
    subprocess.run(
        ["docker", "build", 
         "--build-arg", f"COSMOSDB_ENDPOINT={cosmosdb_endpoint}",
         "--build-arg", f"COSMOSDB_KEY={cosmosdb_key}",
         "-t", frontend_image_name, 
         "-f", "../frontend/Dockerfile", 
         "../frontend"],
        check=True,
        cwd=INFRA_DIR
    )
    print("Pushing frontend container...")
    subprocess.run(
        ["docker", "push", frontend_image_name],
        check=True,
        cwd=INFRA_DIR
    )
    print("Frontend container pushed successfully")
except subprocess.CalledProcessError as e:
    print(f"Error building or pushing frontend container: {e}")
    sys.exit(1)

print(f"Configuring app service {app_name}...")
try:
    subprocess.run([
        "az", "webapp", "config", "container", "set",
        "--resource-group", resource_group,
        "--name", app_name,
        "--container-image-name", frontend_image_name,
        "--container-registry-url", f"https://{registry_login_server}",
        "--container-registry-user", registry_username,
        "--container-registry-password", registry_password
    ], check=True, cwd=PROJECT_ROOT)

    print("Setting app configuration...")
    subprocess.run([
        "az", "webapp", "config", "appsettings", "set",
        "--resource-group", resource_group,
        "--name", app_name,
        "--settings",
        "WEBSITES_PORT=80",
        "WEBSITES_ENABLE_APP_SERVICE_STORAGE=false",
        f"COSMOSDB_ENDPOINT={cosmosdb_endpoint}",
        f"COSMOSDB_KEY={cosmosdb_key}",
        f"COSMOSDB_DATABASE_NAME={cosmosdb_database_name}",
        f"NODE_ENV={ENVIRONMENT.lower()}"
    ], check=True, cwd=PROJECT_ROOT)
    print(f"Restarting {app_name}...")
    subprocess.run([
        "az", "webapp", "restart",
        "--resource-group", resource_group,
        "--name", app_name
    ], check=True, cwd=PROJECT_ROOT)
    print(f"Frontend container deployed to {app_name}")
    print(f"Access at: https://{app_name}.azurewebsites.net/")

    if os.getenv("CI"):
        print("CI")
        summary = f"""
        ╔════════════════════════════════════════════════════════════╗
        ║                     Deployment Complete!                   ║
        ║                                                            ║
        ║  Your application has been successfully deployed to Azure. ║
        ║  You can access it at the URL shown above.                 ║
        ╚════════════════════════════════════════════════════════════╝
        """
        print(summary)
        
        # Write deployment summary to file
        with open("deployment_summary.txt", "w") as f:
            f.write("# Frontend Deployment Status\n\n")
            f.write("## ✅ Deployment completed successfully\n\n")
            f.write(f"**Environment:** {ENVIRONMENT.upper()}\n")
            f.write(f"**App URL:** https://{app_name}.azurewebsites.net/\n")
        
        sys.exit(0)
    else:
        print("Waiting for app to start...")
        time.sleep(10)
        try:
            with urllib.request.urlopen(f"https://{app_name}.azurewebsites.net/") as response:
                print(f"App responded with status code: {response.status}")
        except Exception as e:
            print(f"Error checking app: {e}")
        print("Tailing logs (press Ctrl+C to exit)...")
        subprocess.run([
            "az", "webapp", "log", "tail",
            "--resource-group", resource_group,
            "--name", app_name
        ], cwd=PROJECT_ROOT)
except Exception as e:
    print(f"Error configuring app service: {e}")
    sys.exit(1) 