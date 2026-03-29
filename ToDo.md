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

## Resume-worthy upgrades
- Book lending workflow (checkout, due dates, return, reminders).
- Reviews + ratings with moderation.
- Personalized recommendations (collaborative + content-based hybrid).
- Search indexing with MongoDB Atlas Search or in-app inverted index.
- Observability: structured logs, request tracing, error monitoring.
- Test suite: unit + API tests with coverage reporting.
- CI pipeline (lint, tests, deploy preview) and Dockerized deploy.
- Accessibility audit + keyboard navigation for all flows.
