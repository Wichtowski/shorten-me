import os
import sys
import subprocess
import pathlib

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

# Get app name and resource group from Pulumi outputs
app_name = get_pulumi_output("backend_app_name")
resource_group = get_pulumi_output("resource_group_name")

if not all([registry_login_server, registry_username, registry_password, app_name, resource_group]):
    print("Failed to get required info from Pulumi outputs.\nPulumi outputs:")
    print(f"  container_registry_login_server: {registry_login_server}")
    print(f"  container_registry_username: {registry_username}")
    print(f"  container_registry_password: {registry_password}")
    print(f"  backend_app_name: {app_name}")
    print(f"  resource_group_name: {resource_group}")
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

# Build and push backend container
backend_image_name = f"{registry_login_server}/shortenme-backend:latest"
print(f"Building backend container...")
try:
    # Build backend container
    subprocess.run(
        ["docker", "build", "-t", backend_image_name, "-f", "backend-api/Dockerfile", "./backend-api"],
        check=True,
        cwd=PROJECT_ROOT
    )
    
    # Push the backend container
    print(f"Pushing backend container...")
    subprocess.run(
        ["docker", "push", backend_image_name],
        check=True,
        cwd=PROJECT_ROOT
    )
    
    print("Backend container pushed successfully")
except subprocess.CalledProcessError as e:
    print(f"Error building or pushing backend container: {e}")
    sys.exit(1)

# Configure the app service
print(f"Configuring app service {app_name}...")
try:
    # Set container settings
    subprocess.run([
        "az", "webapp", "config", "container", "set",
        "--resource-group", resource_group,
        "--name", app_name,
        "--container-image-name", backend_image_name,
        "--container-registry-url", f"https://{registry_login_server}",
        "--container-registry-user", registry_username,
        "--container-registry-password", registry_password
    ], check=True, cwd=PROJECT_ROOT)
    
    # Set app settings
    api_url = get_pulumi_output('backend_app_url')
    subprocess.run([
        "az", "webapp", "config", "appsettings", "set",
        "--resource-group", resource_group,
        "--name", app_name,
        "--settings",
        "WEBSITES_PORT=8000",
        "WEBSITES_ENABLE_APP_SERVICE_STORAGE=false",
        f"API_URL=https://{api_url}"
    ], check=True, cwd=PROJECT_ROOT)
    
    # Restart the app
    print(f"Restarting {app_name}...")
    subprocess.run([
        "az", "webapp", "restart",
        "--resource-group", resource_group,
        "--name", app_name
    ], check=True, cwd=PROJECT_ROOT)
    
    print(f"Backend container deployed to {app_name}")
    print(f"Access at: https://{app_name}.azurewebsites.net/")
    
    print("Waiting for app to start...")
    import time
    time.sleep(10)
    
    # Check if app is healthy
    import urllib.request
    try:
        with urllib.request.urlopen(f"https://{app_name}.azurewebsites.net/") as response:
            print(f"App responded with status code: {response.status}")
    except Exception as e:
        print(f"Error checking app: {e}")
    
    # Tail logs
    print("Tailing logs (press Ctrl+C to exit)...")
    subprocess.run([
        "az", "webapp", "log", "tail",
        "--resource-group", resource_group,
        "--name", app_name
    ], cwd=PROJECT_ROOT)
    
except Exception as e:
    print(f"Error configuring app service: {e}")
    sys.exit(1) 