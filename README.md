# Calculate OT

OT (overtime) calculator app.

- Frontend: static host (`index.html`)
- Backend: Railway (`server.js`)
- Database: Supabase PostgreSQL (`DATABASE_URL`)

## Current Production

- Frontend: `https://flukekazo55.github.io/calculate-ot/`
- Backend: `https://calculate-ot-backend-production.up.railway.app`
- Swagger UI: `https://calculate-ot-backend-production.up.railway.app/swagger.html`
- OpenAPI: `https://calculate-ot-backend-production.up.railway.app/openapi.json`

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

Environment variables:

- `DATABASE_URL=<supabase-postgres-connection-string>`
- `PG_FAMILY=4`
- `ENABLE_GIT_SYNC=false`
- `CORS_ORIGINS=https://flukekazo55.github.io`

If testing local frontend too:

- `CORS_ORIGINS=https://flukekazo55.github.io,http://localhost:3000`

## Frontend to Backend Binding

`otApiBase` resolution order:

1. Query string `?api=...`
2. `window.__APP_CONFIG.API_BASE` from `config.js`
3. Existing `localStorage` value (`otApiBase`)

Manual override example:

```text
https://flukekazo55.github.io/calculate-ot/?api=https://calculate-ot-backend-production.up.railway.app
```

## Quick Checks

Backend should respond with JSON:

- `GET /load`
- `POST /save`
- `POST /reset`
- `POST /sync` (disabled when DB mode is enabled)

Example:

```text
https://calculate-ot-backend-production.up.railway.app/load
```

## Supabase Schema and Import

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

Import with variable payload script:

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

- `load_failed` + `ENETUNREACH ... :5432`
Use a DB endpoint reachable from Railway and keep `PG_FAMILY=4`.

- Wrong backend path (frontend calls own domain)
Set absolute `API_BASE` in `config.js` with `https://...`.

## Notes

- Frontend host is static only.
- Backend routes: `/load`, `/save`, `/reset`, `/sync`
- `/sync` is disabled when `DATABASE_URL` is enabled.

## Author

- `flukekazo55`
