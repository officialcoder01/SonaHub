# ARCHITECTURE — ARTISAN MARKET

# PLATFORM OVERVIEW

Artisan Market is a digital marketplace connecting artisans/vendors with customers.

The platform allows:
- vendors to showcase services
- customers to discover artisans
- public users to explore the marketplace

---

# TECH STACK

## Frontend
- React
- React Router
- Tailwind CSS
- Axios

---

## Backend
- Node.js
- Express.js
- Prisma ORM
- PostgreSQL

---

## Authentication
- JWT authentication
- Protected middleware
- Ownership validation

---

# SYSTEM ARCHITECTURE

Backend follows:

Controller → Service → Prisma

---

# BACKEND STRUCTURE

src/
│
├── controllers/
├── services/
├── routes/
├── middleware/
├── utils/
├── prisma/

---

# CONTROLLER RESPONSIBILITY

Controllers should:
- handle req/res
- validate request flow
- return status codes
- delegate business logic to services

Controllers should NOT:
- contain heavy business logic
- contain large Prisma queries

---

# SERVICE RESPONSIBILITY

Services contain:
- business logic
- Prisma queries
- ownership checks
- reusable logic

Services should remain reusable and testable.

---

# ROUTE RESPONSIBILITY

Routes should:
- remain clean
- attach middleware
- map endpoints to controllers

---

# MIDDLEWARE RESPONSIBILITY

Middleware handles:
- authentication
- authorization
- validation
- request protection

Examples:
- verifyToken
- verifyVendor
- validateOwnership

---

# DATABASE DESIGN

## Core Models
- User
- VendorProfile
- Service
- ServiceImage
- Category
- Review
- Booking

---

# SERVICE RELATIONSHIPS

A service:
- belongs to one vendor
- belongs to one category
- can have many images
- can have many reviews

---

# PUBLIC ROUTES

Public routes include:
- homepage
- market page
- service details
- categories
- vendor profiles

No authentication required.

---

# PROTECTED ROUTES

Protected routes include:
- vendor dashboard
- create service
- edit service
- delete service
- manage vendor profile

Requires valid JWT.

---

# AUTHORIZATION RULES

Only service owners can:
- edit services
- delete services
- manage service resources

Security checks must happen on backend.

Frontend protection alone is NOT enough.

---

# API DESIGN

## REST Principles
Use predictable REST routes.

Examples:
- GET /services
- GET /services/:id
- POST /services
- PATCH /services/:id
- DELETE /services/:id

---

# API RESPONSE STRUCTURE

Preferred success response:
```js
res.status(200).json({
  success: true,
  data,
});
```

Preferred error response:
```js
res.status(400).json({
  success: false,
  message: "Meaningful error message",
});
```

---

# FRONTEND ARCHITECTURE

src/
│
├── pages/
├── components/
├── layouts/
├── hooks/
├── services/
├── context/
├── utils/
├── animations/
└── assets/

---

# DATA FETCHING

Frontend should:
- centralize API requests
- separate UI from fetching logic
- handle loading/error states properly

---

# HOME PAGE ARCHITECTURE

Homepage sections:
1. Hero
2. Categories
3. Featured Services
4. Featured Vendors
5. CTA Section

Each section should:
- be modular
- reusable
- independently maintainable

---

# SERVICE DETAILS PAGE

Service details page should contain:
- image gallery
- service information
- vendor information
- reviews
- related services
- booking CTA

---

# PERFORMANCE PRINCIPLES

Prioritize:
- fast loading
- reusable queries
- optimized rendering
- responsive images

Avoid:
- unnecessary rerenders
- over-fetching
- giant components

---

# TESTING PHILOSOPHY

Critical backend features should have:
- integration tests
- authorization tests
- validation tests

Especially:
- auth
- ownership validation
- service management

---

# SCALABILITY PRINCIPLES

The architecture should support future features:
- bookings
- messaging
- payments
- vendor verification
- analytics
- admin dashboard

Structure decisions today should not block future growth.

---

# ENGINEERING PHILOSOPHY

This project values:
- clarity
- maintainability
- security
- scalability
- learning
- craftsmanship

Code should be written for:
- future contributors
- future scaling
- long-term maintainability

Not just immediate functionality.