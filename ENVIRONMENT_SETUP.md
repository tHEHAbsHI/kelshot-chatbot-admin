# Environment Setup for Vercel Deployment

## Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```bash
# Backend API Configuration
# For local development, you can use the direct HTTP URL
# For production, this will be automatically proxied through Vercel
BACKEND_URL=http://ec2-54-91-102-216.compute-1.amazonaws.com/api/v1

# Optional: Override API base URL for client-side calls
# Leave empty to use the default proxy path (/api/v1)
NEXT_PUBLIC_API_URL=
```

## Vercel Deployment

When deploying to Vercel, add the following environment variable in your Vercel dashboard:

- `BACKEND_URL`: `http://ec2-54-91-102-216.compute-1.amazonaws.com/api/v1`

## How the Proxy Works

1. **Local Development**: The app will use the direct HTTP URL to your backend
2. **Production (Vercel)**: All API calls to `/api/v1/*` will be automatically proxied to your backend server
3. **HTTPS Compatibility**: Vercel handles the HTTPS to HTTP proxy, solving CORS and mixed content issues

## API Call Flow

- **Before**: `https://your-app.vercel.app` → `http://ec2-54-91-102-216.compute-1.amazonaws.com/api/v1/users`
- **After**: `https://your-app.vercel.app/api/v1/users` → (Vercel proxy) → `http://ec2-54-91-102-216.compute-1.amazonaws.com/api/v1/users`
