# Library
A calm, minimal library catalog built with EJS, JavaScript, Express, Node.js, and MongoDB.

## Features
- Browse books, authors, and genres
- TF-IDF search + suggestion chips
- Session-based auth with password hashing (bcrypt)
- MongoDB-only persistence (no JSON fallback)
- Health endpoint for hosting checks (`/api/health`)
- Clean, responsive UI

## Getting started
```bash
npm install
npm run dev
```
Open `http://127.0.0.1:3000`.

## Configuration
- `MONGODB_URI`: MongoDB connection string (loaded from `.env` locally; replace with Atlas at deployment)
- `MONGODB_DB_NAME`: database name (defaults to `library_app`)
- `PORT`: server port for hosting platforms (optional)
- `HOST`: defaults to `127.0.0.1` locally; set `0.0.0.0` on hosts if needed
- `ADMIN_USERNAME`: default seeded admin username (optional)
- `ADMIN_PASSWORD`: default seeded admin password (optional)

If `MONGODB_URI` is missing, the server will fail to start.

## Demo admin account
By default, first startup seeds:
- Username: `admin`
- Password: `adminPasswd`

Override with `ADMIN_USERNAME` and `ADMIN_PASSWORD` in your environment.

## Hosting checklist
1. Create a MongoDB Atlas cluster.
2. Add database user + IP/network access.
3. Set environment variables in your host:
	- `MONGODB_URI`
	- `MONGODB_DB_NAME`
	- optionally `ADMIN_USERNAME`, `ADMIN_PASSWORD`
4. Set start command to:
	- `npm start`
5. Health check path:
	- `/api/health`

## Notes
Open through the Node server URL (not file://).
