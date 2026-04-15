# Calculate OT

Separated OT application with:

- Frontend: Angular 18 app in `frontend/`
- Backend: Go API service in `backend/`

Frontend CRUD is localStorage-first, then mirrored to backend API.
Backend persistence behavior:
- Without `DATABASE_URL`: save to `data.json`
- With `DATABASE_URL`: save to both PostgreSQL and `data.json`

## Project Structure

- `frontend/` Angular UI
- `backend/` Go API (`/load`, `/save`, `/reset`)
- `db/` SQL helpers for PostgreSQL setup/import
- `openapi.json` API schema
- `swagger.html` local Swagger UI page for `openapi.json`

## Prerequisites

- Node.js (for Angular frontend)
- Go 1.25+ (for backend)

## Local Development

1. Install frontend dependencies:

```bash
npm --prefix frontend install
```

2. Configure backend URL for frontend:

- Default is already set in `frontend/public/config.js`:

```js
window.__APP_CONFIG = Object.assign({}, window.__APP_CONFIG, {
  API_BASE: "http://localhost:3000",
});
```

3. (Optional) Set backend environment variables.

PowerShell:

```powershell
$env:DATABASE_URL = "postgresql://<user>:<password>@<host>:5432/<db>?sslmode=require"
$env:PORT = "3000"
$env:CORS_ORIGINS = "http://localhost:4200"
```

bash:

```bash
export DATABASE_URL="postgresql://<user>:<password>@<host>:5432/<db>?sslmode=require"
export PORT="3000"
export CORS_ORIGINS="http://localhost:4200"
```

4. Start backend (Go):

```bash
go run ./backend/cmd/server
```

5. Start frontend (Angular):

```bash
npm --prefix frontend start
```

6. Open:

- Frontend: `http://localhost:4200`
- Backend API: `http://localhost:3000`

## Run Both Projects Together

Use 2 terminals from the repository root.

Terminal 1 (backend):

```bash
npm run backend:start
```

Terminal 2 (frontend):

```bash
npm run frontend:start
```

## Root Convenience Scripts

From repository root:

```bash
npm run backend:start
npm run backend:test
npm run frontend:start
npm run frontend:build
```

## Backend Environment Variables

- `PORT` (default: `3000`)
- `DATABASE_URL` (enable PostgreSQL mode when set)
- `OT_TABLE_NAME` (default: `ot_data`)
- `OT_ROW_ID` (default: `singleton`)
- `CORS_ORIGINS` (comma-separated allowlist, e.g. `http://localhost:4200,https://flukekazo55.github.io`)
- `DATA_FILE` (default: `data.json`)

## API Routes

- `GET /healthz` -> health check
- `GET /load` -> load current OT payload
- `POST /save` -> save payload
- `POST /reset` -> reset to empty payload

Notes:
- Frontend reads/writes localStorage first (`otRecords`, `otLastUpdate`).
- API `/save` mirrors the same payload to backend storage.
- In PostgreSQL mode, backend dual-writes to DB and JSON file.

## Frontend Deploy (Static Host)

Build:

```bash
npm --prefix frontend run build
```

Deploy `frontend/dist/frontend/browser/*`.

Set deployed backend URL in `frontend/public/config.js` before building.

## Backend Deploy (Render)

`render.yaml` is configured for Go backend:

- Build: `go build -o backend/bin/server ./backend/cmd/server`
- Start: `./backend/bin/server`

Recommended env vars:

- `DATABASE_URL=<supabase-postgres-connection-string>`
- `CORS_ORIGINS=https://<your-frontend-domain>`

## PostgreSQL Schema and Import

Files:

- `db/schema.sql`
- `db/import_data.sql`
- `db/current_data.json`

Create schema:

```bash
psql "$DATABASE_URL" -f db/schema.sql
```

Import current snapshot:

PowerShell:

```powershell
$json = (Get-Content db/current_data.json -Raw | ConvertFrom-Json | ConvertTo-Json -Compress)
psql "$env:DATABASE_URL" -v ot_payload="$json" -f db/import_data.sql
```

bash:

```bash
json="$(jq -c . db/current_data.json)"
psql "$DATABASE_URL" -v ot_payload="$json" -f db/import_data.sql
```

## Author

- `flukekazo55`
