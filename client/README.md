# searchOnMe Client

React frontend for the `searchOnMe` portfolio website.

## Environment Variables

Create `.env` from `.env.example`.

- `VITE_API_BASE_URL`

Examples:

- local backend: `http://localhost:5000`
- deployed backend on Render: `https://your-render-service.onrender.com`

## Development

From `client/`:

```bash
npm install
npm run dev
```

## Production

Deploy the `client` app to Vercel and set `VITE_API_BASE_URL` to your Render backend URL.

Vercel will handle the production build during deployment, so you do not need to keep a local build output folder in the project.
