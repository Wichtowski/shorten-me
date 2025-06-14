# Shorten-Me Frontend

This is a [Next.js](https://nextjs.org) fullstack project (API + UI) bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

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

All backend logic (authentication, URL shortening, etc.) is implemented in Next.js API routes under `src/app/api/`.

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

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
