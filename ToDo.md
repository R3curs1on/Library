# TODO

## Implemented
- Express + Node backend with REST endpoints for books and users.
- MongoDB persistence with JSON fallback storage.
- TF-IDF search + suggestion chips (Python script + JS fallback).
- Session-based auth with password hashing (bcrypt).
- Admin add/delete book flow with modal form UI.
- Pagination + filters for author, genre, rating, and availability.
- Edit-book flow with prefilled modal and inline validation.
- Logout flow with session expiry handling.

## Next (core)
- Add loading/empty/error UI states for search and fetches on every view.
- Add edit-book flow for bulk updates and cover uploads.
- add EJS templating for server-side rendering of book lists and details.
- Add user registration and profile management flows.
- Add book lending workflow (checkout, due dates, return, reminders).
- Add reviews + ratings with moderation.
- Add personalized recommendations (collaborative + content-based hybrid).
- Add search indexing with MongoDB Atlas Search or in-app inverted index.
- Add observability: structured logs, request tracing, error monitoring.
- Add test suite: unit + API tests with coverage reporting.
- Add CI pipeline (lint, tests, deploy preview) and Dockerized deploy.
- Add accessibility audit + keyboard navigation for all flows.

## Resume-worthy upgrades
- Book lending workflow (checkout, due dates, return, reminders).
- Reviews + ratings with moderation.
- Personalized recommendations (collaborative + content-based hybrid).
- Search indexing with MongoDB Atlas Search or in-app inverted index.
- Observability: structured logs, request tracing, error monitoring.
- Test suite: unit + API tests with coverage reporting.
- CI pipeline (lint, tests, deploy preview) and Dockerized deploy.
- Accessibility audit + keyboard navigation for all flows.


Library/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── pageController.js
│   │   │   ├── bookController.js
│   │   │   └── authController.js
│   │   │
│   │   ├── models/
│   │   │   ├── bookModel.js
│   │   │   └── userModel.js
│   │   │
│   │   ├── routes/
│   │   │   ├── pageRoutes.js
│   │   │   ├── bookRoutes.js
│   │   │   └── authRoutes.js
│   │   │
│   │   ├── services/
│   │   │   └── (keep empty for now)
│   │   │
│   │   └── middleware/
│   │       └── authMiddleware.js
│   │
│   └── server.js
│
├── views/
│   ├── pages/
│   │   ├── index.ejs
│   │   ├── books.ejs
│   │   ├── genres.ejs
│   │   ├── publishers.ejs
│   │   ├── contacts.ejs
│   │   ├── login.ejs
│   │   └── signup.ejs
│   │
│   └── partials/
│       ├── head.ejs
│       ├── navbar.ejs
│       └── footer.ejs
│
├── public/
│   ├── css/
│   │   └── style.css
│   │
│   ├── js/
│   │   ├── main.js
│   │   └── auth.js
│   │
│   └── images/
│       └── library.png
│
├── data/
│   └── library.json   (fallback, optional)
│
├── .env
├── package.json
├── package-lock.json
└── README.md