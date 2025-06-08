import os
import sys
import subprocess
import pathlib
import dotenv

dotenv.load_dotenv()

PROJECT_ROOT = pathlib.Path(__file__).parent.absolute()
INFRA_DIR = os.path.join(PROJECT_ROOT, "infra")

PULUMI_CONFIG_PASSPHRASE = os.getenv("PULUMI_CONFIG_PASSPHRASE")

def get_pulumi_output(output_name):
    try:
        result = subprocess.run(
            ["pulumi", "stack", "output", output_name, "--show-secrets", "--passphrase", PULUMI_CONFIG_PASSPHRASE],
            capture_output=True,
            text=True,
            cwd=INFRA_DIR
        )
        if result.returncode == 0 and result.stdout:
            return result.stdout.strip()
        print(f"Pulumi output for {output_name} not found or empty.")
        return None
    except Exception as e:
        print(f"Error getting Pulumi output {output_name}: {e}")
        return None

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
print(f"Building frontend container...")
try:
    subprocess.run(
        ["docker", "build", "-t", frontend_image_name, "-f", "frontend/Dockerfile", "./frontend"],
        check=True,
        cwd=PROJECT_ROOT
    )
    print(f"Pushing frontend container...")
    subprocess.run(
        ["docker", "push", frontend_image_name],
        check=True,
        cwd=PROJECT_ROOT
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
    cosmos_endpoint = get_pulumi_output('cosmosdb_endpoint')
    cosmos_key = get_pulumi_output('cosmosdb_key')
    cosmosdb_database_name = get_pulumi_output('cosmosdb_account_name')
    subprocess.run([
        "az", "webapp", "config", "appsettings", "set",
        "--resource-group", resource_group,
        "--name", app_name,
        "--settings",
        "WEBSITES_PORT=80",
        "WEBSITES_ENABLE_APP_SERVICE_STORAGE=false",
        f"COSMOS_ENDPOINT={cosmos_endpoint}",
        f"COSMOS_KEY={cosmos_key}",
        f"COSMOSDB_DATABASE_NAME={cosmosdb_database_name}"
    ], check=True, cwd=PROJECT_ROOT)
    print(f"Restarting {app_name}...")
    subprocess.run([
        "az", "webapp", "restart",
        "--resource-group", resource_group,
        "--name", app_name
    ], check=True, cwd=PROJECT_ROOT)
    print(f"Frontend container deployed to {app_name}")
    print(f"Access at: https://{app_name}.azurewebsites.net/")
    print("Waiting for app to start...")
    import time
    time.sleep(10)
    import urllib.request
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