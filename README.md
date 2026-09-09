# SonaHub

SonaHub is a mobile-first marketplace connecting local artisans and service vendors with customers. It includes a React/Vite frontend, an Express/Prisma/PostgreSQL API, service image uploads, vendor dashboards, bookings, and reviews.

For setup, architecture, environment variables, database model, endpoint contracts, user flows, testing, and known scope boundaries, read the full [project documentation](PROJECT_DOCUMENTATION.md).

Quick start with Docker:

```bash
docker compose up --build
```

The client runs at `http://localhost:5173`; the API health check is `http://localhost:3000/health`.
