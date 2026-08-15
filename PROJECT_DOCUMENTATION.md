# SonaHub — Project Documentation

## Purpose

SonaHub is a mobile-first marketplace that helps customers find and book local artisans and other service vendors. Vendors create a public business profile, publish service listings, receive booking requests, complete jobs, and can be reviewed by the customer who made a completed booking.

The repository is a two-application project:

| Application | Location | Responsibility |
| --- | --- | --- |
| Web client | `frontend/` | React single-page application for visitors, customers, and vendors |
| API | `backend/` | REST API, authentication, business rules, uploads, and database access |

PostgreSQL is the system database; Cloudinary stores uploaded service images. Docker Compose can run the client, API, and database together for local development.

## What is implemented

- Public home page with categories, newest services, vendor lists, and top-rated vendors.
- Searchable, filterable, paginated marketplace. Filters include service title, category, Nigerian state/LGA-derived location, and newest/oldest sort.
- Public service detail pages with images, reviews, vendor information, related services, and booking entry point.
- Public vendor profiles, including their services, pinned services, ratings, and reviews.
- Customer and vendor registration/login using JWTs.
- Vendor profile creation/editing and service creation/editing/archiving.
- Up to three Cloudinary-hosted images per service and up to five pinned services per vendor profile.
- Booking creation, customer cancellation, and vendor acceptance, rejection, and completion.
- One review per completed booking, by the booking customer only.
- Backend Jest/Supertest coverage for the main auth, vendor, service, booking, review, and recommendation flows.

## Current scope boundaries

The following are present in the schema or navigation but are not complete product features:

- `Message` records exist in Prisma, but there are no API routes or UI for messaging.
- The vendor dashboard's Reviews and Settings pages are placeholders.
- The Analytics page is a lightweight placeholder/stat display, not a reporting system.
- `BookingStatus.IN_PROGRESS` exists in the database enum, but the current API has no transition that sets it.
- `Service.isFeatured` exists in the database but is not used by current API queries or UI. The feature control used by the product is `Service.isPinned`.
- There is no admin API or user interface, although `ADMIN` is a database role. Registration deliberately only accepts `CUSTOMER` and `VENDOR`.
- There are no payment, vendor-verification workflow, notifications, or messaging endpoints yet.

## Architecture

```
Browser (React + Vite + Tailwind)
        │ fetch + Bearer JWT for protected requests
        ▼
Express API (routes → controllers → services)
        │ Prisma 7 + PostgreSQL adapter
        ▼
PostgreSQL

Service-image uploads: browser → Multer memory storage → Cloudinary → image URL in PostgreSQL
```

Backend code is intentionally split into layers:

- **Routes** attach paths, authentication, validation, and file-upload middleware.
- **Controllers** translate HTTP requests/responses and pass work to services.
- **Services** contain database queries, ownership checks, state-transition rules, and response shaping.
- **Prisma schema/migrations** define persisted data and database evolution.

The frontend keeps API calls in `frontend/src/services/`, authentication state in `context/AuthContext.jsx`, pages in `pages/`, reusable UI in `components/`, and shared page chrome in `layouts/`.

## Repository map

```
.
├── backend/
│   ├── api/index.js                 Vercel serverless entry point
│   ├── prisma/schema.prisma         Database schema
│   ├── prisma/migrations/           Migration history
│   ├── seed.js                      Idempotent category seed script
│   └── src/
│       ├── app.js                   Express app, CORS, rate limiting, route mounting
│       ├── routes/                  HTTP route definitions
│       ├── controllers/             HTTP handlers
│       ├── services/                Domain and Prisma logic
│       ├── middlewares/             JWT, validation, Multer
│       ├── validators/              express-validator and service field rules
│       ├── utils/                   tokens, ratings, roles, Cloudinary upload helpers
│       └── config/                  Prisma and Cloudinary setup
├── frontend/
│   └── src/
│       ├── App.jsx                  Route table
│       ├── context/                 Local-storage-backed auth state
│       ├── services/                API client functions
│       ├── pages/                   Public, auth, customer, and dashboard screens
│       ├── components/              Reusable UI grouped by feature
│       └── layouts/                 Public/auth/vendor dashboard frames
├── Test/backend/                    Jest API and service tests
├── docker/postgres/init/            Test database initialization script
├── docker-compose.yml               Local multi-container environment
├── ARCHITECTURE.md                  Original architectural guidelines
├── PROJECT_RULES.md                 Engineering and UI conventions
└── UI_GUIDELINES.md                 Visual design guidelines
```

## Technology choices

| Area | Technology |
| --- | --- |
| Client | React 19, React Router 7, Vite 7 |
| Styling/UX | Tailwind CSS, Framer Motion, Lucide React |
| API | Node.js, Express 5 |
| Persistence | PostgreSQL 16, Prisma 7 with `@prisma/adapter-pg` |
| Security | bcrypt password hashing, JSON Web Tokens, express-rate-limit, CORS |
| Uploads | Multer memory storage and Cloudinary |
| Tests | Jest 30 and Supertest |
| Local orchestration | Docker Compose |

## Prerequisites

- Node.js 22+ (the Dockerfiles use Node 22)
- npm
- PostgreSQL 16+ if running outside Docker
- A Cloudinary account for service image uploads
- Docker Desktop, optional but recommended for the full local stack

## Configuration

Create `backend/.env` with these values. Keep the real file private; do not commit credentials.

```dotenv
POSTGRES_USER=sonahub
POSTGRES_PASSWORD=choose-a-local-password
POSTGRES_DB=sonahub
POSTGRES_DB_TEST=sonahub_test

DATABASE_URL=postgresql://sonahub:choose-a-local-password@localhost:5433/sonahub
DATABASE_URL_TEST=postgresql://sonahub:choose-a-local-password@localhost:5433/sonahub_test
NODE_ENV=development
PORT=3000
JWT_SECRET=use-a-long-random-secret

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Optional, comma-separated browser origins for production.
FRONTEND_ORIGIN=https://your-frontend.example.com
```

Create `frontend/.env` for the browser API base URL:

```dotenv
VITE_API_URL=http://localhost:3000/api
```

`VITE_API_URL` must include the `/api` suffix because frontend service modules append paths such as `/services` and `/auth`. The API accepts local Vite origins by default. In production it only accepts origins in `FRONTEND_ORIGIN` (comma-separated if more than one).

## Running locally

### Docker Compose (recommended)

From the repository root:

```bash
docker compose up --build
```

This starts:

- PostgreSQL on host port `5433`;
- the API on `http://localhost:3000`;
- Vite on `http://localhost:5173`.

The compose API command generates the Prisma client and starts Nodemon. The PostgreSQL init script creates the test database when `POSTGRES_DB_TEST` is supplied. Apply database migrations and seed categories after the database is available:

```bash
docker compose exec app npx prisma migrate deploy
docker compose exec app node seed.js
```

### Run without Docker

1. Start PostgreSQL and create the main and test databases referenced by `backend/.env`.
2. In `backend/`, install dependencies, generate Prisma Client, apply migrations, seed categories, then start the API:

   ```bash
   npm ci
   npm run prisma:generate
   npx prisma migrate deploy
   node seed.js
   npm run dev
   ```

3. In a second terminal, in `frontend/`, install and start Vite:

   ```bash
   npm ci
   npm run dev
   ```

Useful URLs:

- Client: `http://localhost:5173`
- API health check: `http://localhost:3000/health`
- API root: `http://localhost:3000/`

## Database model

| Model | Key relationships and purpose |
| --- | --- |
| `User` | Login identity. Has role `CUSTOMER`, `VENDOR`, or `ADMIN`; optionally has one vendor profile; owns customer bookings and reviews. |
| `VendorProfile` | One-to-one extension of a vendor user. Stores business name, bio, location, verification status, services, received bookings, and reviews. |
| `Category` | Named service grouping. The supplied seed adds nine artisan categories. |
| `Service` | A listing owned by a vendor and category. Has images, bookings, reviews, archival state, and pinned/featured flags. |
| `serviceImage` | A Cloudinary URL attached to a service. The model name is lowercase in the existing schema; preserve it unless doing a coordinated Prisma migration. |
| `Booking` | Connects one customer, vendor, and service. Stores status, optional customer message, lifecycle timestamps, and one optional review. |
| `Review` | One rating/comment created for one completed booking. It also links to its customer, vendor, and service for efficient queries. |
| `Message` | Reserved data model for booking messages; unused by current endpoints/UI. |

### Booking lifecycle

```
PENDING ──vendor accepts──> ACCEPTED ──vendor completes──> COMPLETED ──customer may review──> Review
   │                           │
   ├──vendor rejects──> REJECTED
   └──customer cancels──────────────> CANCELLED
```

Only a pending booking can be accepted/rejected. A customer may cancel a pending or accepted booking. Only an accepted booking can be completed. `IN_PROGRESS` is defined but not currently reachable through the API.

### Service lifecycle

Services are never hard-deleted through the app. `PATCH /api/services/:id` sets `isArchived: true`, which hides the service from public listings and vendor service lists while retaining its historical database records. Editing does not remove old images; new uploaded images are appended. This because there are other models which depend on the services, like the booking model. So we need the service data to be able to maintain the booking and review records.

## Authentication and authorization

- Registration validates name, email, password, and either `CUSTOMER` or `VENDOR` role. Passwords require 8–128 characters with lowercase, uppercase, and numeric characters.
- Passwords are bcrypt-hashed with 10 rounds.
- Login and registration return a JWT with `id` and `role`; its expiry is seven days.
- The frontend stores the token and sanitized user object in `localStorage` and applies `Authorization: Bearer <token>` to protected API calls.
- `ProtectedRoute` protects UI routes, but the API is the authorization authority.
- Login endpoints are rate-limited to five requests per IP per 15-minute window. The limiter is mounted on `/api/auth`, so it currently also applies to registration requests.
- Vendors must own a service or booking to manage it. A vendor profile is required before creating services or managing vendor bookings.

### Important implementation note

The booking service blocks a vendor from booking their own service, but does **not** currently enforce `CUSTOMER` role at booking creation. Do not describe vendor-to-vendor booking as forbidden unless that missing server-side rule is implemented. The frontend also opens the booking modal for an authenticated vendor viewing another vendor's service.

## API reference

Base URL: `${VITE_API_URL}` in the frontend (normally `http://localhost:3000/api`). Protected endpoints require `Authorization: Bearer <JWT>`.

### Authentication

| Method and path | Access | Request body | Result |
| --- | --- | --- | --- |
| `POST /auth/register` | Public | `name`, `email`, `password`, `role` | Creates a customer/vendor and returns `{ token, user }` (201). |
| `POST /auth/login` | Public | `email`, `password` | Returns `{ token, user }`. |

### Services and categories

| Method and path | Access | Purpose |
| --- | --- | --- |
| `GET /services` | Public | Paginated listing. Query: `search`, `category` (category ID), `location`, `sort` (`newest`/`oldest`), `page`, `limit`. Returns `{ services, pagination }`. |
| `GET /services/categories` | Public | Categories with a count of non-archived services. |
| `GET /services/:id` | Public | Service detail payload: `{ service, relatedServices }`, including reviews and computed rating statistics. |
| `POST /services` | Vendor | Multipart request with `title`, `description`, `price`, `categoryId`, and up to three `images` files. |
| `GET /services/my` | Vendor | Current vendor's non-archived services. |
| `PUT /services/:id` | Owner vendor | Replaces editable fields and optionally appends up to three new images. Multipart body. |
| `PATCH /services/:id` | Owner vendor | Archives the service (the UI calls this “delete”). |
| `PATCH /services/:id/pin` | Owner vendor | Pins a service for the vendor profile; maximum five active pins. |
| `PATCH /services/:id/unpin` | Owner vendor | Removes a profile pin. |

`price` is required by the current create/edit validation, even though the Prisma column is nullable. Images must be JPEG, PNG, WebP, or GIF and each is limited to 5 MB.

### Vendors and recommendations

| Method and path | Access | Purpose |
| --- | --- | --- |
| `GET /vendors` | Public | All vendors with completed-job count and calculated review stats. |
| `GET /vendors/:id` | Public | Public vendor profile by **vendor profile ID**, including services, pinned services, and reviews. |
| `POST /vendors/profile` | Vendor | Creates profile from `businessName`, `bio`, `location`. |
| `PUT /vendors/profile` | Owner vendor | Updates those profile fields. |
| `GET /vendors/me` | Vendor | Current profile plus service/booking/review aggregate information. |
| `GET /recommendations/top-rated-vendors` | Public | Up to three vendors with at least three ratings, ordered by average rating then review count. |

### Bookings and reviews

| Method and path | Access | Purpose |
| --- | --- | --- |
| `POST /bookings` | Authenticated | Creates a booking from `serviceId` and optional `message`; cannot book one's own service. |
| `GET /bookings/my` | Authenticated | Lists bookings where the current user is the customer. |
| `PATCH /bookings/:id/cancel` | Booking customer | Cancels a `PENDING` or `ACCEPTED` booking. |
| `GET /vendor/bookings` | Vendor | Lists bookings assigned to the current vendor plus status counts. |
| `PATCH /vendor/bookings/:id/accept` | Assigned vendor | Moves `PENDING` to `ACCEPTED`. |
| `PATCH /vendor/bookings/:id/reject` | Assigned vendor | Moves `PENDING` to `REJECTED`. |
| `PATCH /vendor/bookings/:id/complete` | Assigned vendor | Moves `ACCEPTED` to `COMPLETED`. |
| `POST /reviews` | Booking customer | Creates one 1–5 rating and optional comment for a completed booking. Body: `bookingId`, `rating`, `comment`. |

Validation middleware returns `422` for malformed registration, login, profile, or review requests. Other domain errors usually return `{ message }` with the service's status (for example, 403, 404, or 409); unexpected errors return 500. Response envelopes vary by endpoint, so use the frontend service modules as the immediate contract source when changing a caller.

## Frontend routes and user journeys

| Route | Audience | Screen/function |
| --- | --- | --- |
| `/` | Public | Home: hero, category links, featured/newest services, top-rated vendors, vendor list, CTA. |
| `/market` | Public | Marketplace with URL-synchronized filters, 400 ms search debounce, skeletons, and pagination. |
| `/market/services/:id` | Public | Service information, gallery, reviews, related services, vendor card, booking trigger. |
| `/vendors/:id` | Public | Vendor profile. `:id` is a `VendorProfile.id`, not `User.id`. |
| `/login`, `/register` | Public | Auth forms; redirect vendors to `/dashboard`, customers to `/`. |
| `/bookings` | Logged-in customer or vendor | Customer-booking view, cancellation, details, and review submission. |
| `/dashboard/*` | Vendor | Dashboard layout and vendor-only tools. |
| `/dashboard` | Vendor | Overview and onboarding/profile creation when no vendor profile exists. |
| `/dashboard/services` | Vendor | Service list, archival, and pin/unpin control. |
| `/dashboard/create-service` | Vendor | New listing form. |
| `/dashboard/services/:id/edit` | Vendor | Listing edit form. |
| `/dashboard/bookings` | Vendor | Booking list and accept/reject/complete actions. |
| `/dashboard/vendor-profile` | Vendor | Profile, pinned services, catalog, and aggregate stats. |
| `/dashboard/profile/edit` | Vendor | Business profile edit. |

All data-fetching screens use explicit loading, error, and empty states. Skeleton components are favored over full-page loading spinners to preserve layout stability.

## Testing

Backend tests are in `Test/backend/` and mock Prisma/Cloudinary where appropriate. The Jest configuration transforms ESM source for the test runner.

```bash
cd backend
npm test
```

Run client quality checks separately:

```bash
cd frontend
npm run lint
npm run build
```

Before shipping a backend schema change, also run the appropriate Prisma migration workflow against a disposable/local database and verify `npm test`.

## Development guidelines

- Read `PROJECT_RULES.md` and `UI_GUIDELINES.md` before changing product behavior or appearance.
- Preserve the controller → service → Prisma separation. Keep database and permission logic out of controllers and frontend components.
- Add backend authorization checks for any vendor/customer-owned resource; frontend route checks are only a usability layer.
- Put browser requests in `frontend/src/services/`; do not hardcode API URLs in components.
- Keep mobile layouts first, preserve loading layout with skeletons, and provide meaningful error/empty states for async UI.
- Prefer archiving over deleting service records unless a future data-retention decision says otherwise.
- Update this document, the Prisma schema/migrations, route tests, and frontend service wrapper together when an endpoint contract changes.

## Deployment notes

`backend/api/index.js` exports the Express app for Vercel, and `backend/vercel.json` configures the backend deployment. In a deployed environment, configure the production database URL, `JWT_SECRET`, all Cloudinary values, and `FRONTEND_ORIGIN`. The production CORS policy does not allow arbitrary browser origins.

Ensure the frontend build receives `VITE_API_URL` pointing at the deployed API with `/api` appended, and that the API's `FRONTEND_ORIGIN` includes the deployed frontend origin exactly.

## Likely next work

The data model and navigation suggest these natural extensions:

1. Add customer-role enforcement during booking creation and ensure frontend booking controls mirror it.
2. Implement the `IN_PROGRESS` booking transition or remove it if it is not part of the desired workflow.
3. Build messaging endpoints/UI around the existing `Message` model, with booking-participant authorization.
4. Decide whether `isFeatured` is needed alongside `isPinned`; remove or implement it consistently.
5. Build the dashboard reviews, settings, and analytics features against explicit API contracts.
6. Add an admin workflow and vendor verification process if the `ADMIN`/`isVerified` fields are to become functional.
