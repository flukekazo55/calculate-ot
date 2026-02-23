# Calculate OT

OT (overtime) calculator app.

- Frontend: GitHub Pages (`index.html`)
- Backend: Railway (`server.js`)
- Database: Supabase PostgreSQL (`DATABASE_URL`)

## Local Run

1. Install Node.js (LTS)
2. Install dependencies

```bash
npm install
```

3. (Recommended) set database URL

```bash
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<db>?sslmode=require
```

4. Start app

```bash
npm start
```

5. Open

```text
http://localhost:3000
```

## Frontend Deploy (GitHub Pages)

Workflow: `.github/workflows/deploy-pages.yml`

1. Push to `main`
2. GitHub -> `Settings` -> `Pages` -> Source = `GitHub Actions`
3. GitHub -> `Settings` -> `Secrets and variables` -> `Actions` -> `Variables`
4. Add variable:
   - `API_BASE_URL=https://calculate-ot-backend-production.up.railway.app`
5. Run workflow (or push again)

Frontend URL:

```text
https://flukekazo55.github.io/calculate-ot/
```

## Backend Deploy (Railway)

Service settings:

- Build command: `npm install`
- Start command: `npm start`

Environment variables:

- `DATABASE_URL=<supabase-postgres-connection-string>`
- `PG_FAMILY=4`
- `ENABLE_GIT_SYNC=false`
- `CORS_ORIGINS=https://flukekazo55.github.io`

If you also test from local frontend:

- `CORS_ORIGINS=https://flukekazo55.github.io,http://localhost:3000`

Backend URL example:

```text
https://calculate-ot-backend-production.up.railway.app
```

## Connect Frontend To Backend

`otApiBase` resolution order:

1. Query string: `?api=...`
2. GitHub variable `API_BASE_URL` (injected into `config.js` during Pages deploy)
3. Existing `localStorage` value (`otApiBase`)

Important: `API_BASE_URL` must be absolute URL (include `https://`).

Manual override example:

```text
https://flukekazo55.github.io/calculate-ot/?api=https://calculate-ot-backend-production.up.railway.app
```

## Supabase Schema And Import

Files:

- `db/schema.sql`
- `db/import_data.sql`
- `db/import_data_current.sql`

Create schema:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

Import from current local snapshot:

```bash
psql "$DATABASE_URL" -f db/import_data_current.sql
```

Or import using variable payload script:

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

## API Docs (Swagger)

- Local: `http://localhost:3000/swagger.html`
- Backend: `https://calculate-ot-backend-production.up.railway.app/swagger.html`
- OpenAPI JSON: `https://calculate-ot-backend-production.up.railway.app/openapi.json`

## Notes

- GitHub Pages is static only.
- Backend routes: `/load`, `/save`, `/reset`, `/sync`
- `/sync` is disabled when `DATABASE_URL` is enabled.

## Author

- `flukekazo55`
