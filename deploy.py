import os
import sys
import subprocess
import json
import pathlib
import argparse

# Parse command line arguments
print("Available arguments:")
print("--skip-build: Skip building Docker images")
print("--skip-push: Skip pushing Docker images")
print("--deploy-only: Only run Pulumi deployment (skip build and push)")
print("Example: python deploy.py --skip-build --skip-push --deploy-only")
print("--------------------------------")

parser = argparse.ArgumentParser(description="Deploy the application")
parser.add_argument("--skip-build", action="store_true", help="Skip building Docker images")
parser.add_argument("--skip-push", action="store_true", help="Skip pushing Docker images")
parser.add_argument("--deploy-only", action="store_true", help="Only run Pulumi deployment (skip build and push)")
args = parser.parse_args()

# If --deploy-only is specified, set both skip flags
if args.deploy_only:
    args.skip_build = True
    args.skip_push = True

# Get absolute path to the project root and infra directory
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

# Check if we need to create ACR first time
print("Checking if container registry exists...")
registry_login_server = get_pulumi_output("container_registry_login_server")
registry_username = get_pulumi_output("container_registry_username")
registry_password = get_pulumi_output("container_registry_password")

if not registry_login_server:
    print("Container registry not found. Running Pulumi to create it...")
    try:
        subprocess.run(
            ["pulumi", "up", "-y"], 
            check=True,
            cwd=INFRA_DIR
        )
        
        # Get the registry info now that it exists
        registry_login_server = get_pulumi_output("container_registry_login_server")
        registry_username = get_pulumi_output("container_registry_username")
        registry_password = get_pulumi_output("container_registry_password")
        
        if not registry_login_server:
            print("Failed to get container registry info after creation")
            sys.exit(1)
    except subprocess.CalledProcessError as e:
        print(f"Failed to run Pulumi to create registry: {e}")
        sys.exit(1)

if not args.skip_build and not args.skip_push:
    # Login to ACR once for all operations
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

# Diagnostic function for checking deployment status            
def check_deployment_status(resource_group, app_name):
    """Check container logs and status for a deployed app"""
    print(f"\nDiagnosing {app_name}...")
    try:
        # Check logs - use the correct log command
        print(f"Fetching logs for {app_name}...")
        subprocess.run(
            ["az", "webapp", "log", "tail", 
             "--resource-group", resource_group, 
             "--name", app_name],
            text=True,
            cwd=PROJECT_ROOT
        )
        
        # Check app status
        print(f"Checking configuration for {app_name}...")
        subprocess.run(
            ["az", "webapp", "config", "show", 
             "--resource-group", resource_group, 
             "--name", app_name,
             "--query", "containerConfig"],
            text=True,
            cwd=PROJECT_ROOT
        )
    except Exception as e:
        print(f"Error retrieving diagnostics: {e}")

# Function to update container settings for web apps
def update_app_container_settings(resource_group, app_name, registry_server, username, password, image_name):
    """Update container settings for a web app and restart it"""
    print(f"\nUpdating container settings for {app_name}...")
    try:
        # Set container configuration with updated parameter names
        subprocess.run([
            "az", "webapp", "config", "container", "set",
            "--resource-group", resource_group,
            "--name", app_name,
            "--container-image-name", f"{registry_server}/{image_name}:latest",
            "--container-registry-url", f"https://{registry_server}",
            "--container-registry-user", username,
            "--container-registry-password", password
        ], check=True, cwd=PROJECT_ROOT)
        
        print(f"Container settings updated for {app_name}")
        
        # Configure web app settings
        subprocess.run([
            "az", "webapp", "config", "set",
            "--resource-group", resource_group,
            "--name", app_name,
            "--always-on", "true",
            "--startup-file", "",
            "--websites-enable-app-service-storage", "false",
            "--linux-fx-version", f"DOCKER|{registry_server}/{image_name}:latest"
        ], check=True, cwd=PROJECT_ROOT)
        
        print(f"App settings updated for {app_name}")
        
        # Restart app
        print(f"Restarting {app_name}...")
        subprocess.run([
            "az", "webapp", "restart",
            "--resource-group", resource_group,
            "--name", app_name
        ], check=True, cwd=PROJECT_ROOT)
        
        print(f"Successfully restarted {app_name}")
        
        # Log deployment
        subprocess.run([
            "az", "webapp", "log", "deployment", "show",
            "--resource-group", resource_group,
            "--name", app_name
        ], text=True, cwd=PROJECT_ROOT)
        
    except Exception as e:
        print(f"Error updating container settings: {e}")

# Function to check web app health
def check_webapp_health(app_url):
    print(f"\nChecking health of {app_url}...")
    try:
        import urllib.request
        import time
        
        # Try up to 3 times with 10 second intervals
        for i in range(3):
            try:
                print(f"Health check attempt {i+1}...")
                with urllib.request.urlopen(f"https://{app_url}") as response:
                    if response.status == 200:
                        print(f"✅ App is healthy! Status code: {response.status}")
                        return True
                    else:
                        print(f"❌ App returned status code: {response.status}")
            except Exception as e:
                print(f"❌ Connection error: {e}")
            
            # Wait before next attempt
            print("Waiting 10 seconds before next attempt...")
            time.sleep(10)
        
        print("⚠️ App is not responding after multiple attempts")
        return False
    
    except Exception as e:
        print(f"Error checking health: {e}")
        return False

# Function to build and push an image
def build_and_push_image(image_name, dockerfile, component_name):
    if not args.skip_build:
        print(f"Building {component_name} Docker image...")
        try:
            subprocess.run(
                ["docker", "build", "-t", image_name, "-f", dockerfile, "."], 
                check=True,
                cwd=PROJECT_ROOT
            )
            print(f"{component_name} image built successfully!")
        except subprocess.CalledProcessError as e:
            print(f"Failed to build {component_name} Docker image: {e}")
            sys.exit(1)
    
    if not args.skip_push:
        print(f"Pushing {component_name} image to {image_name}...")
        try:
            subprocess.run(
                ["docker", "push", image_name], 
                check=True,
                cwd=PROJECT_ROOT
            )
            print(f"{component_name} image pushed successfully!")
        except subprocess.CalledProcessError as e:
            print(f"Failed to push {component_name} Docker image: {e}")
            sys.exit(1)

# Build and push Function App Docker image
functions_image_name = f"{registry_login_server}/shortenme-functions:latest"
build_and_push_image(functions_image_name, "Dockerfile.functions", "Functions")

# Build and push Frontend Docker image
frontend_image_name = f"{registry_login_server}/shortenme-frontend:latest"
build_and_push_image(frontend_image_name, "Dockerfile.frontend", "Frontend")

# Deploy the infrastructure with Pulumi (which will use the images we just pushed)
print("Running Pulumi to deploy the application...")

try:
    # Run pulumi up with preview and confirmation
    result = subprocess.run(
        ["pulumi", "up"], 
        text=True,
        cwd=INFRA_DIR
    )
    
    if result.returncode == 0:
        print("Successfully deployed application via Pulumi")
        
        # Get outputs directly
        func_app_url = get_pulumi_output("function_app_url")
        frontend_url = get_pulumi_output("frontend_url")
        resource_group = get_pulumi_output("resource_group_name")
        
        # Display URLs
        if func_app_url:
            func_app_name = func_app_url.split('.')[0]
            print(f"Function App URL: https://{func_app_url}/")
            check_deployment_status(resource_group, func_app_name)
            
            # Update container settings for function app
            update_app_container_settings(
                resource_group, 
                func_app_name, 
                registry_login_server, 
                registry_username, 
                registry_password, 
                "shortenme-functions"
            )
            
            # Check if the function app is healthy
            check_webapp_health(func_app_url)
            
        if frontend_url:
            frontend_app_name = frontend_url.split('.')[0]
            print(f"Frontend URL: https://{frontend_url}/")
            check_deployment_status(resource_group, frontend_app_name)
            
            # Update container settings for frontend app
            update_app_container_settings(
                resource_group, 
                frontend_app_name, 
                registry_login_server, 
                registry_username, 
                registry_password, 
                "shortenme-frontend"
            )
            
            # Check if the frontend app is healthy
            check_webapp_health(frontend_url)
        
        print("\nTroubleshooting tips if you see 'Application Error':")
        print("1. Check Docker build contexts are correct in Dockerfiles")
        print("2. Make sure your apps are listening on the right port (80 or the PORT env var)")
        print("3. Verify your container can access all required resources")
        print("4. Try rebuilding with 'docker build' locally to test")
    else:
        print("Deployment failed")
        sys.exit(1)
        
except Exception as e:
    print(f"Error deploying with Pulumi: {e}")
    sys.exit(1)

# Function to deploy a test container
def deploy_test_container(resource_group, app_name, registry_server, username, password):
    """Deploy a simple test container to troubleshoot deployment issues"""
    print(f"\nDeploying test container to {app_name}...")
    
    # Build the test image
    test_image_name = f"{registry_server}/test-container:latest"
    try:
        # Build test container
        subprocess.run(
            ["docker", "build", "-t", test_image_name, "-f", "Dockerfile.test", "."],
            check=True,
            cwd=PROJECT_ROOT
        )
        
        # Push the test container
        subprocess.run(
            ["docker", "push", test_image_name],
            check=True,
            cwd=PROJECT_ROOT
        )
        
        # Set container configuration with updated parameter names
        subprocess.run([
            "az", "webapp", "config", "container", "set",
            "--resource-group", resource_group,
            "--name", app_name,
            "--container-image-name", test_image_name,
            "--container-registry-url", f"https://{registry_server}",
            "--container-registry-user", username,
            "--container-registry-password", password
        ], check=True, cwd=PROJECT_ROOT)
        
        # Restart app
        print(f"Restarting {app_name}...")
        subprocess.run(
            ["az", "webapp", "restart",
             "--resource-group", resource_group,
             "--name", app_name],
            check=True,
            cwd=PROJECT_ROOT
        )
        
        print(f"Test container deployed to {app_name}")
        
        # Wait for app to start
        import time
        print("Waiting 30 seconds for app to start...")
        time.sleep(30)
        
        # Check if the app is responding
        app_url = f"{app_name}.azurewebsites.net"
        check_webapp_health(app_url)
        
    except Exception as e:
        print(f"Error deploying test container: {e}") 