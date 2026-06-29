# Shorten-Me Frontend

This is a [Vinext](https://vinext.io/) fullstack project (API + UI) built on Cloudflare's Next.js-compatible tooling.

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`.
The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) compatibility to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Environment Setup

### Local Development

Create a `.env.local` file with the following variables:

```env
COSMOSDB_ENDPOINT=your_cosmosdb_endpoint
COSMOSDB_KEY=your_cosmosdb_key
COSMOSDB_DATABASE_NAME=shortenme
SECRET_KEY=your_jwt_secret
ALGORITHM=HS256
```

### Production Environment

The following environment variables must be set in Azure App Service:

- `COSMOSDB_ENDPOINT`: CosmosDB endpoint
- `COSMOSDB_KEY`: CosmosDB key
- `COSMOSDB_DATABASE_NAME`: CosmosDB database name
- `SECRET_KEY`: JWT secret
- `ALGORITHM`: JWT algorithm (e.g. HS256)

## API & Backend Logic

All backend logic (authentication, URL shortening, etc.) is implemented in Vinext API routes under `src/app/api/`.

### Key Endpoints

- `POST /api/shorten`: Create a new short URL
- `GET /r/[slug]`: Redirect to the original URL
- `GET /api/urls`: List all URLs for the authenticated user
- `DELETE /api/urls/[id]`: Delete a URL

## Deployment

### Manual Deployment

1. Build the Docker image:

```bash
docker build -t shortenme-frontend -f Dockerfile .
```

2. Push to Azure Container Registry:

```bash
docker tag shortenme-frontend <registry>.azurecr.io/shortenme-frontend:latest
docker push <registry>.azurecr.io/shortenme-frontend:latest
```

### GitHub Actions Deployment

The frontend is automatically deployed via GitHub Actions when changes are pushed to the main branch. The workflow:

1. Builds the Docker image
2. Pushes to Azure Container Registry
3. Updates the Azure App Service

## Learn More

To learn more about Vinext, take a look at the following resources:

- [Vinext Documentation](https://vinext.io/) - learn about Vinext features and API compatibility.
- [Cloudflare GitHub repository](https://github.com/cloudflare/vinext) - the Vinext source and release notes.

Vinext still works with the same App Router and API route concepts from Next.js.
