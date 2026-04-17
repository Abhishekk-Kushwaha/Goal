<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run the app locally

This project is a Vite + React app with Supabase authentication.

## Environment setup

Copy `.env.example` to `.env.local` or `.env` and provide only browser-safe public values:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-publishable-key
```

Notes:

- `VITE_*` variables are bundled into the frontend and are visible to users.
- Never place private secrets such as service role keys, OpenAI keys, Gemini keys, or other server-only API keys in Vite client env vars.
- If you need private API access, move that call behind a backend/serverless function and keep the secret there.

## Run locally

1. Install dependencies with `npm install`.
2. Start the dev server with `npm run dev`.
