import os
import sys
import subprocess
import pathlib
import argparse
import json

# Parse command line arguments
parser = argparse.ArgumentParser(description="Test container deployment")
parser.add_argument("--app-name", required=True, help="The name of the App Service to deploy to")
parser.add_argument("--resource-group", required=True, help="The resource group name")
args = parser.parse_args()

# Get absolute path to the project root
PROJECT_ROOT = pathlib.Path(__file__).parent.absolute()
INFRA_DIR = os.path.join(PROJECT_ROOT, "infra")

def get_pulumi_output(output_name):
    """Get a specific output from Pulumi stack"""
    try:
        result = subprocess.run(
            ["pulumi", "stack", "output", output_name, "--show-secrets"],
            capture_output=True,
            text=True,
            cwd=INFRA_DIR
        )
        if result.returncode == 0 and result.stdout:
            return result.stdout.strip()
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
    print("Failed to get container registry info")
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

# Build and push test container
test_image_name = f"{registry_login_server}/test-container:latest"
print(f"Building test container...")
try:
    # Build test container
    subprocess.run(
        ["docker", "build", "-t", test_image_name, "-f", "Dockerfile.test", "."],
        check=True,
        cwd=PROJECT_ROOT
    )
    
    # Push the test container
    print(f"Pushing test container...")
    subprocess.run(
        ["docker", "push", test_image_name],
        check=True,
        cwd=PROJECT_ROOT
    )
    
    print("Test container pushed successfully")
except subprocess.CalledProcessError as e:
    print(f"Error building or pushing test container: {e}")
    sys.exit(1)

# Configure the app service
print(f"Configuring app service {args.app_name}...")
try:
    # Set container settings
    subprocess.run([
        "az", "webapp", "config", "container", "set",
        "--resource-group", args.resource_group,
        "--name", args.app_name,
        "--container-image-name", test_image_name,
        "--container-registry-url", f"https://{registry_login_server}",
        "--container-registry-user", registry_username,
        "--container-registry-password", registry_password
    ], check=True, cwd=PROJECT_ROOT)
    
    # Set app settings
    subprocess.run([
        "az", "webapp", "config", "appsettings", "set",
        "--resource-group", args.resource_group,
        "--name", args.app_name,
        "--settings",
        "WEBSITES_PORT=80",
        "WEBSITES_ENABLE_APP_SERVICE_STORAGE=false"
    ], check=True, cwd=PROJECT_ROOT)
    
    # Restart the app
    print(f"Restarting {args.app_name}...")
    subprocess.run([
        "az", "webapp", "restart",
        "--resource-group", args.resource_group,
        "--name", args.app_name
    ], check=True, cwd=PROJECT_ROOT)
    
    print(f"Test container deployed to {args.app_name}")
    print(f"Access at: https://{args.app_name}.azurewebsites.net/")
    
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