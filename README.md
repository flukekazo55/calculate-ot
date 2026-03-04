# Calculate OT

Simple overtime (OT) tracker with a static frontend and a Node.js backend.

- Frontend: static files (`index.html`, `config.js`)
- Backend: Express server (`server.js`)
- Storage mode:
  - PostgreSQL when `DATABASE_URL` is set
  - Local `data.json` file when `DATABASE_URL` is empty

## Current Production

- Frontend: `https://flukekazo55.github.io/calculate-ot/`
- Backend: `https://calculate-ot-backend-production.up.railway.app`
- Swagger UI: `https://calculate-ot-backend-production.up.railway.app/swagger.html`
- OpenAPI JSON: `https://calculate-ot-backend-production.up.railway.app/openapi.json`

## Local Run

1. Install Node.js (LTS).
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables (optional for local file mode):

PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://<user>:<password>@<host>:5432/<db>?sslmode=require"
```

bash:

```bash
export DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<db>?sslmode=require"
```

4. Start server:

```bash
npm start
```

5. Open:

```text
http://localhost:3000
```

## Environment Variables

- `PORT` (default: `3000`)
- `DATABASE_URL` (enable PostgreSQL mode when set)
- `PG_FAMILY` (default: `4`, useful for IPv4 on some hosts)
- `OT_TABLE_NAME` (default: `ot_data`)
- `OT_ROW_ID` (default: `singleton`)
- `ENABLE_GIT_SYNC` (default: enabled unless set to `false`)
- `CORS_ORIGINS` (comma-separated allowlist, for example `https://flukekazo55.github.io,http://localhost:3000`)

## API Routes

- `GET /load` -> load current OT payload
- `POST /save` -> save payload
- `POST /reset` -> reset to empty payload
- `POST /sync` -> git-based sync (disabled when `DATABASE_URL` is set or `ENABLE_GIT_SYNC=false`)

Quick check:

```text
https://calculate-ot-backend-production.up.railway.app/load
```

## Frontend to Backend Binding

`otApiBase` is resolved in this order:

1. Query string: `?api=...`
2. `window.__APP_CONFIG.API_BASE` from `config.js`
3. Existing `localStorage` value: `otApiBase`

Manual override example:

```text
https://flukekazo55.github.io/calculate-ot/?api=https://calculate-ot-backend-production.up.railway.app
```

## Frontend Deploy (Static Host)

Deploy these files:

- `index.html`
- `config.js`
- `swagger.html`
- `openapi.json`

Set backend URL in `config.js`:

```js
window.__APP_CONFIG = Object.assign({}, window.__APP_CONFIG, {
  API_BASE: "https://calculate-ot-backend-production.up.railway.app",
});
```

## Backend Deploy (Railway)

Service settings:

- Build command: `npm install`
- Start command: `npm start`

Recommended environment variables:

- `DATABASE_URL=<supabase-postgres-connection-string>`
- `PG_FAMILY=4`
- `ENABLE_GIT_SYNC=false`
- `CORS_ORIGINS=https://flukekazo55.github.io`

If you also test from localhost:

- `CORS_ORIGINS=https://flukekazo55.github.io,http://localhost:3000`

## Supabase Schema and Import

Files:

- `db/schema.sql`
- `db/import_data.sql`
- `db/import_data_current.sql`

Create schema:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

Import current snapshot:

```bash
psql "$DATABASE_URL" -f db/import_data_current.sql
```

Import using payload variable:

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

## Troubleshooting

- `load_failed` with network errors on `:5432`
  Use a DB endpoint reachable from the backend host and keep `PG_FAMILY=4`.
- Frontend calling wrong backend origin
  Set absolute `API_BASE` in `config.js` (`https://...`).

## Author

- `flukekazo55`

