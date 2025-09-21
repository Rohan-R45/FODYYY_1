# Repository Info

- **Name**: FODYYY
- **Root**: c:\\Users\\pendu\\FODYYY_1
- **Backend**: Node.js + Express, Mongoose, JWT auth
- **Frontend**: React (Vite), React Router, TailwindCSS

## Backend Highlights
- Entry: server.js
- Routes: routes/ (auth, users, restaurants, menu, orders)
- Models: models/ (User, Restaurant, MenuItem, Order)
- Middleware: middleware/ (auth, validation, errorHandler)
- Utils: utils/
- Env files: .env*, port and DB via config/index.js
- CORS allowlist and API caching configured

## Frontend Highlights
- Entry: fodyyy-frontend/src/main.jsx
- App routes in src/App.jsx
- Context: src/context (Auth, Cart, Restaurant)
- Pages: src/pages
- Components: src/components (+ SEO/Meta)
- Services for API calls in src/services
- Build: Vite (dist in fodyyy-frontend/dist)

## Development Scripts
- Backend: npm start / npm run start:dev (at repo root)
- Frontend: cd fodyyy-frontend and use npm run dev / build / preview

## Notes
- Anonymous GET API responses are cached briefly; authenticated or mutating responses are no-store.
- Static assets served with long-term caching; HTML is no-cache.
- HelmetProvider + Meta component enable per-page SEO.