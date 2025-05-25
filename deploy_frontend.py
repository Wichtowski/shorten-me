import os
import sys
import subprocess
import pathlib
import argparse

# Parse command line arguments
parser = argparse.ArgumentParser(description="Deploy frontend container")
parser.add_argument("--app-name", default="shortenme-frontendf41d91fb", help="The frontend App Service name")
parser.add_argument("--resource-group", default="shortenme-rg", help="The resource group name")
args = parser.parse_args()

# Get absolute path to the project root
PROJECT_ROOT = pathlib.Path(__file__).parent.absolute()
INFRA_DIR = os.path.join(PROJECT_ROOT, "infra")

# Helper to get pulumi output
def get_pulumi_output(output_name):
    try:
        result = subprocess.run(
            ["pulumi", "stack", "output", output_name, "--show-secrets"],
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

# Get registry info
print("Getting container registry information...")
registry_login_server = get_pulumi_output("container_registry_login_server")
registry_username = get_pulumi_output("container_registry_username")
registry_password = get_pulumi_output("container_registry_password")

if not all([registry_login_server, registry_username, registry_password]):
    print("Failed to get container registry info.\nPulumi outputs:")
    print(f"  container_registry_login_server: {registry_login_server}")
    print(f"  container_registry_username: {registry_username}")
    print(f"  container_registry_password: {registry_password}")
    sys.exit(1)

# Login to ACR
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

# Build and push frontend container
frontend_image_name = f"{registry_login_server}/shortenme-frontend:latest"
print(f"Building frontend container...")
try:
    # Build frontend container
    subprocess.run(
        ["docker", "build", "-t", frontend_image_name, "-f", "Dockerfile.frontend", "."],
        check=True,
        cwd=PROJECT_ROOT
    )
    
    # Push the frontend container
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

# Configure the app service
print(f"Configuring app service {args.app_name}...")
try:
    # Set container settings
    subprocess.run([
        "az", "webapp", "config", "container", "set",
        "--resource-group", args.resource_group,
        "--name", args.app_name,
        "--container-image-name", frontend_image_name,
        "--container-registry-url", f"https://{registry_login_server}",
        "--container-registry-user", registry_username,
        "--container-registry-password", registry_password
    ], check=True, cwd=PROJECT_ROOT)
    
    # Set app settings
    api_url = get_pulumi_output('function_app_url')
    subprocess.run([
        "az", "webapp", "config", "appsettings", "set",
        "--resource-group", args.resource_group,
        "--name", args.app_name,
        "--settings",
        "WEBSITES_PORT=80",
        "WEBSITES_ENABLE_APP_SERVICE_STORAGE=false",
        f"API_URL=https://{api_url}"
    ], check=True, cwd=PROJECT_ROOT)
    
    # Restart the app
    print(f"Restarting {args.app_name}...")
    subprocess.run([
        "az", "webapp", "restart",
        "--resource-group", args.resource_group,
        "--name", args.app_name
    ], check=True, cwd=PROJECT_ROOT)
    
    print(f"Frontend container deployed to {args.app_name}")
    print(f"Access at: https://{args.app_name}.azurewebsites.net/")
    
    print("Waiting for app to start...")
    import time
    time.sleep(10)
    
    # Check if app is healthy
    import urllib.request
    try:
        with urllib.request.urlopen(f"https://{args.app_name}.azurewebsites.net/") as response:
            print(f"App responded with status code: {response.status}")
    except Exception as e:
        print(f"Error checking app: {e}")
    
    # Tail logs
    print("Tailing logs (press Ctrl+C to exit)...")
    subprocess.run([
        "az", "webapp", "log", "tail",
        "--resource-group", args.resource_group,
        "--name", args.app_name
    ], cwd=PROJECT_ROOT)
    
except Exception as e:
    print(f"Error configuring app service: {e}")
    sys.exit(1) 