# Frontend for Shorten-Me

React-based frontend for the URL shortening service.

## Structure

- `src/`
  - `components/` - Reusable UI components
  - `context/` - React context providers
  - `pages/` - Page components
  - `utils/` - Utility functions
- `public/` - Static assets
- `build/` - Production build output

## Local Development

### Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Create `.env` file with configuration
   ```
   REACT_APP_API_URL=http://localhost:8000
   ```

3. Start development server
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:3000`

## Building for Production

```bash
npm run build
```

This creates a production build in the `build/` directory.

## Deployment

The frontend is automatically deployed through the deployment script:

```bash
python ../deploy_frontend.py
```

This script:
1. Builds a Docker container using `Dockerfile.frontend`
2. Pushes it to the Azure Container Registry
3. Updates the Azure App Service to use the new container image

## Testing

Run tests with:
```bash
npm test
```

## Styling

The project uses Tailwind CSS for styling. Configuration is in `tailwind.config.js`.

## Adding New Features

1. Create components in the appropriate subdirectory of `src/components/`
2. For new pages, add components in `src/pages/`
3. Update routes as needed
