# URL Shortener with Azure Integration

A FastAPI-based URL shortener service that uses Azure Table Storage for data persistence and includes user authentication.

## Features

- User registration and authentication
- URL shortening with custom slugs
- Click tracking
- Azure Table Storage integration
- JWT-based authentication

## Prerequisites

- Python 3.8+
- Azure account with Table Storage
- Azure Storage connection string

## Setup

1. Clone the repository:

```bash
git clone <repository-url>
cd shorten-me
```

2. Create and activate a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:

```bash
pip install -r requirements.txt
```

4. Create a `.env` file with your configuration:

```env
AZURE_STORAGE_CONNECTION_STRING=your_storage_connection_string
AZURE_STORAGE_ACCOUNT_NAME=your_storage_account_name
AZURE_STORAGE_ACCOUNT_KEY=your_storage_account_key
SECRET_KEY=your_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
BASE_URL=http://localhost:8000
```

## Running the Application

Start the development server:

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

## API Documentation

Once the server is running, you can access:

- Swagger UI documentation: `http://localhost:8000/docs`
- ReDoc documentation: `http://localhost:8000/redoc`

## API Endpoints

### Authentication

- `POST /auth/register` - Register a new user
- `POST /auth/token` - Login and get access token

### URLs

- `POST /urls/` - Create a new shortened URL
- `GET /urls/{slug}` - Redirect to original URL
- `GET /urls/` - Get all URLs for current user

## Security

- Passwords are hashed using bcrypt
- JWT tokens are used for authentication
- Azure Table Storage provides secure data persistence

## License

MIT
