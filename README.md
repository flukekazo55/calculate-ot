# Calculate OT

OT (overtime) calculator app.

- Frontend: `index.html` (GitHub Pages)
- Backend: `server.js` (Node.js + Express on Render)
- Database: Supabase PostgreSQL (`DATABASE_URL`)

## Run Locally

1. Install Node.js LTS
2. Install dependencies

```bash
npm install
```

3. Set environment (optional but recommended)

```bash
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
```

4. Start server

```bash
npm start
```

5. Open

```text
http://localhost:3000
```

## Deploy Frontend (GitHub Pages)

Workflow file: `.github/workflows/deploy-pages.yml`

1. Push to `main`
2. GitHub -> `Settings` -> `Pages`
3. Set source to `GitHub Actions`
4. Run workflow (or push again)

Frontend URL:

```text
https://flukekazo55.github.io/calculate-ot/
```

## Deploy Backend (Render)

Files:

- `render.yaml`
- `.github/workflows/deploy-backend-render.yml` (optional deploy-hook trigger)

### Render Setup

1. Open Render dashboard
2. New -> `Blueprint` (or Web Service from this repo)
3. Select this repository
4. Set environment variables:

- `DATABASE_URL=<supabase-postgres-connection-string>`
- `ENABLE_GIT_SYNC=false`
- `CORS_ORIGINS=https://flukekazo55.github.io`

If you want localhost to call the same backend too:

- `CORS_ORIGINS=https://flukekazo55.github.io,http://localhost:3000`

### Optional: Auto-trigger backend deploy from GitHub Actions

1. In Render service, copy Deploy Hook URL
2. GitHub -> `Settings` -> `Secrets and variables` -> `Actions`
3. Add secret `RENDER_DEPLOY_HOOK_URL`
4. Push changes to `main`

## Connect Frontend To Backend

After backend is live (example: `https://calculate-ot-backend.onrender.com`), open frontend once with query param:

```text
https://flukekazo55.github.io/calculate-ot/?api=https://calculate-ot-backend.onrender.com
```

The app stores this API base in `localStorage` key `otApiBase`.

## Backend Environment Variables

- `DATABASE_URL` (Supabase PostgreSQL)
- `OT_TABLE_NAME` (optional, default: `ot_data`)
- `OT_ROW_ID` (optional, default: `singleton`)
- `PORT` (auto from host)
- `CORS_ORIGINS` (comma-separated allow list, or `*`)
- `ENABLE_GIT_SYNC` (`true`/`false`)

## Supabase Schema And Import SQL

Files:

- `db/schema.sql`
- `db/import_data.sql`

Create schema:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

Import `data.json` into row `singleton`:

PowerShell:

```powershell
$json = (Get-Content data.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress)
psql "$env:DATABASE_URL" -v ot_payload="$json" -f db/import_data.sql
```

bash:

```bash
json="$(jq -c . data.json)"
psql "$DATABASE_URL" -v ot_payload="$json" -f db/import_data.sql
```

## Swagger API Docs

Files:

- `openapi.json`
- `swagger.html`

Open docs:

- Local: `http://localhost:3000/swagger.html`
- Render backend: `https://<your-render-domain>/swagger.html`

## Notes

- GitHub Pages is static only; backend routes do not run there.
- Production storage should use `DATABASE_URL`.
- `/sync` is disabled when `DATABASE_URL` is enabled.

## Author

- `flukekazo55`
