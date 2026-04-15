# Calculate OT

Separated OT application with:

- Frontend: Angular 18 app in `frontend/`
- Backend: Go API service in `backend/`

Frontend CRUD is localStorage-first, then mirrored to backend API.
Backend persistence behavior:
- Backend requires `MONGODB_URI` and persists OT/Auth data in MongoDB only

## Project Structure

- `frontend/` Angular UI
- `backend/` Go API (`/load`, `/save`, `/reset`)
- `db/` legacy SQL helper files (not used in MongoDB-only mode)
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

3. Set backend environment variables.

PowerShell:

```powershell
$env:MONGODB_URI = "mongodb+srv://<user>:<password>@<cluster>/<optional-db>?retryWrites=true&w=majority"
$env:MONGODB_DB = "calculate_ot"
$env:PORT = "3000"
$env:CORS_ORIGINS = "http://localhost:4200"
```

bash:

```bash
export MONGODB_URI="mongodb+srv://<user>:<password>@<cluster>/<optional-db>?retryWrites=true&w=majority"
export MONGODB_DB="calculate_ot"
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
- `MONGODB_URI` (required)
- `MONGODB_DB` (default: `calculate_ot`)
- `OT_TABLE_NAME` (default: `ot_data`)
- `OT_ROW_ID` (default: `singleton`)
- `USERS_TABLE_NAME` (default: `users`)
- `CORS_ORIGINS` (comma-separated allowlist, e.g. `http://localhost:4200,https://flukekazo55.github.io`)

## API Routes

- `GET /healthz` -> health check
- `GET /load` -> load current OT payload
- `POST /save` -> save payload
- `POST /reset` -> reset to empty payload
- `POST /auth/register` -> create user (`username`, `email`, `password`)
- `POST /auth/login` -> login with `identity` (username/email) and `password`

Notes:
- Frontend reads/writes localStorage first (`otRecords`, `otLastUpdate`).
- API `/save` writes the same payload to MongoDB.

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

- `MONGODB_URI=<mongodb-connection-string>`
- `MONGODB_DB=calculate_ot`
- `CORS_ORIGINS=https://<your-frontend-domain>`

## Author

- `flukekazo55`
