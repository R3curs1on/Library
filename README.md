# Library
A calm, minimal library catalog built with HTML, CSS, JavaScript, Express, Node.js, and MongoDB. Includes TF-IDF powered search with smart suggestions and a JSON fallback when MongoDB is not configured.

## Features
- Browse books, authors, and genres
- TF-IDF search + suggestion chips
- Session-based auth with password hashing (bcrypt)
- Admin add/edit/delete books with a modal form UI
- Pagination + filters for author, genre, rating, and availability
- MongoDB persistence with JSON fallback
- Clean, responsive UI

## Getting started
```bash
npm install
npm run dev
```
Open `http://127.0.0.1:3000`.

## Configuration
- `MONGODB_URI`: MongoDB connection string (optional)
- `MONGODB_DB_NAME`: database name (defaults to `library_app`)

If `MONGODB_URI` is not set, the app uses `data/library.json` for storage.

## Demo admin account
Local JSON storage seeds an admin user:
- Username: `admin`
- Password: `adminPasswd`

## Notes
If you open the HTML files directly (file://), API calls will fail. Run the server and open the localhost URL instead.
