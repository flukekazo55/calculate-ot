# Calculate OT

OT (overtime) calculator app.

- Frontend: `index.html` (can run on GitHub Pages)
- Backend: `server.js` (Node.js + Express)
- Data file: `data.json`

## Run Locally (Frontend + Backend)

1. Install Node.js LTS
2. Install dependencies

```bash
npm install
```

3. Start server

```bash
npm start
```

4. Open

```text
http://localhost:3000
```

## Deploy FE + BE on Netlify (Single Project)

This repo now includes:

- `netlify.toml`
- `netlify/functions/load.js`
- `netlify/functions/save.js`
- `netlify/functions/reset.js`
- `netlify/functions/sync.js`

Set these values in Netlify:

- Build command: `npm install`
- Publish directory: `.`
- Functions directory: `netlify/functions`
- Environment variable: `DATABASE_URL=<your-neon-connection-string>`

Then deploy by connecting this GitHub repository to Netlify.

Notes:

- Frontend (`index.html`) is served as static.
- Backend routes (`/load`, `/save`, `/reset`, `/sync`) are redirected to Netlify Functions by `netlify.toml`.
- `/sync` is intentionally disabled on Netlify and returns `501`.
- If `DATABASE_URL` is set, data is persisted in Neon PostgreSQL.
- If `DATABASE_URL` is not set, fallback storage uses Netlify Blobs.

## Deploy Frontend on GitHub Pages

Workflow file: `.github/workflows/deploy-pages.yml`

1. Push to `main`
2. GitHub -> `Settings` -> `Pages`
3. Set source to `GitHub Actions`
4. Run workflow (or push again)

Frontend URL format:

```text
https://<github-username>.github.io/<repo-name>/
```

Example:

```text
https://flukekazo55.github.io/calculate-ot/
```

## Deploy Backend on Render

Files added:

- `render.yaml` (Render blueprint)
- `.github/workflows/deploy-backend-render.yml` (optional deploy-hook trigger)

### A) Create service on Render

1. Open Render dashboard
2. New -> `Blueprint` (or Web Service from this repo)
3. Select this repository
4. Deploy

### B) Set backend environment variables on Render

- `ENABLE_GIT_SYNC=false` (recommended for hosted backend)
- `CORS_ORIGINS=https://flukekazo55.github.io`

If you want localhost to call the same backend too:

- `CORS_ORIGINS=https://flukekazo55.github.io,http://localhost:3000`

### C) Optional: Auto-trigger backend deploy from GitHub Actions

1. In Render service, copy Deploy Hook URL
2. In GitHub repo -> `Settings` -> `Secrets and variables` -> `Actions`
3. Add secret: `RENDER_DEPLOY_HOOK_URL`
4. Push changes to `main`

## Connect GitHub Pages Frontend to Render Backend

After backend is live (example: `https://calculate-ot-backend.onrender.com`), open frontend with query param once:

```text
https://flukekazo55.github.io/calculate-ot/?api=https://calculate-ot-backend.onrender.com
```

The app stores this API base in `localStorage` key `otApiBase`.

## Backend Environment Variables

- `PORT` (auto from host)
- `CORS_ORIGINS` (comma-separated allow list, or `*`)
- `ENABLE_GIT_SYNC` (`true`/`false`)

## Important Notes

- GitHub Pages is static only; backend routes do not run there.
- Hosted backend that writes `data.json` may lose data on redeploy/restart depending on platform plan.
- For durable production data, migrate from `data.json` to a database.

## Troubleshooting

### Pages workflow errors

If Pages shows `Not Found` during configure/deploy:

1. Verify `Settings` -> `Pages` source is `GitHub Actions`
2. Verify `Settings` -> `Actions` -> `General` -> `Workflow permissions` = `Read and write permissions`
3. Confirm repo/org policy allows Pages

### Backend deploy workflow does not run deploy

If Action says missing secret, add `RENDER_DEPLOY_HOOK_URL`.

## Author

- `flukekazo55`
