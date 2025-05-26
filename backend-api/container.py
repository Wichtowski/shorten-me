from typing import Optional, Dict, Any
from azure.cosmos import CosmosClient, PartitionKey
from azure.cosmos.exceptions import CosmosHttpResponseError
import os
from dotenv import load_dotenv
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ConfigurationError(Exception):
    """Raised when there's an error in the configuration."""
    pass

class Container:
    _instance: Optional['Container'] = None
    _cosmos_client: Optional[CosmosClient] = None
    _database = None
    _users_container = None
    _urls_container = None
    _anonymous_container = None
    _config: Dict[str, Any] = {}
    _initialized: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(Container, cls).__new__(cls)
        return cls._instance

    def _validate_config(self):
        """Validate the required configuration."""
        required_vars = [
            "COSMOS_ENDPOINT",
            "COSMOS_KEY",
            "SECRET_KEY",
            "ALGORITHM",
            "ACCESS_TOKEN_EXPIRE_MINUTES",
            "BASE_URL"
        ]
        
        missing_vars = [var for var in required_vars if not os.getenv(var)]
        if missing_vars:
            raise ConfigurationError(
                f"Missing required environment variables: {', '.join(missing_vars)}"
            )

    def _load_config(self):
        """Load and validate configuration."""
        try:
            load_dotenv()
            self._validate_config()
            
            self._config = {
                "cosmos_endpoint": os.getenv("COSMOS_ENDPOINT"),
                "cosmos_key": os.getenv("COSMOS_KEY"),
                "secret_key": os.getenv("SECRET_KEY"),
                "algorithm": os.getenv("ALGORITHM", "HS256"),
                "token_expire_minutes": int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")),
                "base_url": os.getenv("BASE_URL", "http://localhost:8000"),
                "database_name": "urlshortener",
                "max_anonymous_urls": 3
            }
            
            logger.info("Configuration loaded successfully")
        except Exception as e:
            logger.error(f"Error loading configuration: {str(e)}")
            raise ConfigurationError(f"Failed to load configuration: {str(e)}")

    def _initialize(self):
        """Initialize the container with required services."""
        if self._initialized:
            return

        try:
            self._load_config()
            
            if not self._cosmos_client:
                self._cosmos_client = CosmosClient(
                    self._config["cosmos_endpoint"],
                    self._config["cosmos_key"]
                )
                self._database = self._cosmos_client.create_database_if_not_exists(
                    id=self._config["database_name"]
                )
                self._initialize_containers()
            
            self._initialized = True
            logger.info("Container initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing container: {str(e)}")
            raise

    def _initialize_containers(self):
        """Initialize all required containers."""
        try:
            self._users_container = self._database.create_container_if_not_exists(
                id="users",
                partition_key=PartitionKey(path="/username")
            )
            self._urls_container = self._database.create_container_if_not_exists(
                id="urls",
                partition_key=PartitionKey(path="/user_id")
            )
            self._anonymous_container = self._database.create_container_if_not_exists(
                id="anonymous_usage",
                partition_key=PartitionKey(path="/ip_address")
            )
            logger.info("Containers initialized successfully")
        except CosmosHttpResponseError as e:
            logger.error(f"Error creating containers: {str(e)}")
            raise

    def get_config(self, key: str) -> Any:
        """Get a configuration value."""
        return self._config.get(key)

    def get_all_config(self) -> Dict[str, Any]:
        """Get all configuration values."""
        return self._config.copy()

    @property
    def cosmos_client(self) -> CosmosClient:
        """Get the Cosmos DB client instance."""
        if not self._initialized:
            self._initialize()
        return self._cosmos_client

    @property
    def database(self):
        """Get the database instance."""
        if not self._initialized:
            self._initialize()
        return self._database

    @property
    def users_container(self):
        """Get the users container instance."""
        if not self._initialized:
            self._initialize()
        return self._users_container

    @property
    def urls_container(self):
        """Get the urls container instance."""
        if not self._initialized:
            self._initialize()
        return self._urls_container

    @property
    def anonymous_container(self):
        """Get the anonymous usage container instance."""
        if not self._initialized:
            self._initialize()
        return self._anonymous_container

    def health_check(self) -> Dict[str, Any]:
        """Check the health of all services."""
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "cosmos_db": "healthy",
                "database": "healthy",
                "containers": {
                    "users": "healthy",
                    "urls": "healthy",
                    "anonymous": "healthy"
                }
            }
        }

        try:
            # Check Cosmos DB connection
            self.cosmos_client.read_database(self._config["database_name"])
        except Exception as e:
            health_status["services"]["cosmos_db"] = f"unhealthy: {str(e)}"
            health_status["status"] = "unhealthy"

        try:
            # Check containers
            self.users_container.read()
        except Exception as e:
            health_status["services"]["containers"]["users"] = f"unhealthy: {str(e)}"
            health_status["status"] = "unhealthy"

        try:
            self.urls_container.read()
        except Exception as e:
            health_status["services"]["containers"]["urls"] = f"unhealthy: {str(e)}"
            health_status["status"] = "unhealthy"

        try:
            self.anonymous_container.read()
        except Exception as e:
            health_status["services"]["containers"]["anonymous"] = f"unhealthy: {str(e)}"
            health_status["status"] = "unhealthy"

        return health_status

# Create a global container instance
container = Container() 