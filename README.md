# OpenClaw Monitor Dashboard

Simple web dashboard to monitor:
- GitHub repository activity (latest commits)
- Vercel deployment health (latest state + deployment count in 24h)

## Local run
Open `index.html` for UI only. API routes require Vercel runtime.

## Deploy on Vercel
Set these environment variables in Vercel Project Settings:

- `GITHUB_REPO` (example: `ayuubb/openclaw-project`)
- `GITHUB_TOKEN` (optional for higher rate limits/private repos)
- `VERCEL_TOKEN`
- `VERCEL_PROJECT_ID`

Then deploy.

## API endpoints
- `/api/github`
- `/api/vercel`
