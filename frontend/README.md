# Shorten Frontend

This is a [Vinext](https://vinext.io/) fullstack project (API + UI) built on Cloudflare's Next.js-compatible tooling.

> **Project status:** This frontend is not currently deployed to Azure, MongoDB Atlas, or Vercel. Azure/Cosmos DB deployment notes below are legacy documentation from the college class project, and MongoDB/Vercel references in the codebase are not part of an active deployment.

## Getting Started

First, run the development server:

```bash
bun run dev
```

Open [http://localhost:3001](http://localhost:3001) with your browser to see the result.

You can start editing the page by modifying `src/app/page.tsx`.
The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) compatibility to automatically optimize and load Geist. This does not mean the project is deployed on Vercel.

## Environment Setup

### Local Development

The active v3 API uses Cloudflare KV through the `SHORTENME_KV` Worker binding.
There is no local Docker database image to start for the current app path.

For local development, keep runtime values in `.env` or `.env.local`:

```env
DEPLOY_ENVIRONMENT=development
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_API_TOKEN=your-cloudflare-api-token
CLOUDFLARE_KV_NAMESPACE_ID=your-environment-kv-namespace-id
JWT_SECRET=replace-with-a-long-random-secret
BASIC_AUTH_USERNAME=dev-user
BASIC_AUTH_PASSWORD=dev-password
```

The `SHORTENME_KV` binding is declared in `wrangler.jsonc`.
If login or signup returns `Local KV storage is not configured`, check the local Cloudflare KV binding before debugging the UI.

Running `bun run dev` generates an ignored `wrangler.local.jsonc` file from `wrangler.jsonc` and your local env values.
That generated config points `SHORTENME_KV` at the development namespace with `remote: true`, so local auth and short URLs reuse the development Cloudflare KV namespace.

### Legacy Azure Production Environment

The following environment variables were used by the legacy Azure App Service deployment:

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

## Legacy Deployment

These deployment notes are kept for reference only. The project is not currently deployed to Azure.

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

The legacy Azure workflow deployed the frontend when changes were pushed to the main branch. That deployment is not currently active. The workflow:

1. Builds the Docker image
2. Pushes to Azure Container Registry
3. Updates the Azure App Service

## Learn More

To learn more about Vinext, take a look at the following resources:

- [Vinext Documentation](https://vinext.io/) - learn about Vinext features and API compatibility.
- [Cloudflare GitHub repository](https://github.com/cloudflare/vinext) - the Vinext source and release notes.

Vinext still works with the same App Router and API route concepts from Next.js.
