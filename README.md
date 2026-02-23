# Calculate OT

OT (overtime) calculator web app with local record history, built with `Node.js` + `Express` for local server mode.

## Features

- Calculate OT from start/end time
- Support weekday/weekend/holiday rules
- Save OT history and show total balance
- Use OT in `hh:mm` format
- Thai/English UI toggle

## Project Structure

```text
calculate-ot/
- index.html
- server.js
- data.json
- package.json
- run-ot.sh
- .github/workflows/deploy-pages.yml
```

## Run Locally (Full Mode)

Use this mode if you want backend endpoints and Git sync (`/sync`) to work.

1. Install Node.js (LTS)
2. Install dependencies:

```bash
npm install
```

3. Start server:

```bash
npm start
```

4. Open:

```text
http://localhost:3000
```

## Deploy on GitHub Pages (Static Mode)

This repo includes GitHub Actions workflow:

- `.github/workflows/deploy-pages.yml`

### Steps

1. Push this repository to GitHub
2. In GitHub: `Settings` -> `Pages`
3. Set source/build to `GitHub Actions`
4. Push to `main` or run workflow manually from `Actions`

### Important Limitation

GitHub Pages is static hosting only.

- Works: UI, calculations, local browser storage
- Not available on Pages: `server.js` endpoints (`/load`, `/save`, `/reset`, `/sync`), server-side Git pull/push

In static mode, data is kept in browser `localStorage`.

## GitHub Pages Error Fix

If workflow fails with:

- `Get Pages site failed ... Not Found`

Make sure:

1. Workflow uses `actions/configure-pages@v5` with `enablement: true`
2. Repo Actions permissions allow write access:
   - `Settings` -> `Actions` -> `General` -> `Workflow permissions` -> `Read and write permissions`
3. You have admin rights for the repository
4. Organization policy does not block GitHub Pages

## Author

- `flukekazo55`
