# PROJECT RULES — ARTISAN MARKET

## Project Philosophy

Artisan Market is not just a CRUD application.

It is a digital ecosystem connecting local artisans with customers through a modern, trustworthy, mobile-first marketplace experience.

The platform should feel:
- human
- reliable
- modern
- lightweight
- community-driven
- practical

NOT:
- overly corporate
- overly flashy
- cluttered
- overly animated
- generic

Codex should prioritize:
1. clean structure
2. readability
3. scalability
4. consistency
5. maintainability
6. responsive design
7. reusable architecture

Creativity is encouraged ONLY within the design system and architecture boundaries.

---

# GENERAL DEVELOPMENT RULES

## Mobile First
- Always design mobile-first before desktop.
- Every layout must work properly on small screens.
- Avoid horizontal overflow at all costs.
- Grids must collapse gracefully.

---

## Clean Code
- Keep components focused and readable.
- Avoid deeply nested JSX.
- Split reusable UI into components.
- Avoid giant files when possible.

Preferred:
- 50–250 lines per component

---

## Reusability
If a UI pattern appears more than once:
- extract it into a reusable component.

Examples:
- ServiceCard
- VendorCard
- SectionHeader
- EmptyState
- LoadingSpinner
- ReviewCard
- CategoryCard

---

## Naming Conventions

### Components
Use PascalCase.

Examples:
- ServiceCard.jsx
- FeaturedVendors.jsx

---

### Hooks
Use:
- useSomething

Examples:
- useAuth
- useFetchServices

---

### Utilities
Use camelCase.

Examples:
- formatCurrency
- truncateText

---

### Pages
Pages must end with:
- Page.jsx

Examples:
- HomePage.jsx
- MarketPage.jsx
- ServiceDetailsPage.jsx

---

## File Organization

Frontend structure:

src/
│
├── components/
├── pages/
├── layouts/
├── hooks/
├── services/
├── context/
├── utils/
├── assets/
├── routes/
└── animations/

---

# COMMENTS & DOCUMENTATION RULES

## IMPORTANT RULE

Inline comments are REQUIRED for important logic.

This project prioritizes learning, readability, and maintainability.

Codex must NOT generate large blocks of logic without explanation.

---

## Where Comments MUST Exist

### Backend
Required for:
- controllers
- middleware
- services
- authentication
- authorization
- validation
- Prisma queries
- business logic

---

### Frontend
Required for:
- complex state logic
- data fetching
- conditional rendering
- animations
- responsive behavior
- reusable abstractions
- filtering/search logic
- hooks
- navigation behavior

---

## Comment Style

Use meaningful comments.

GOOD:
```js
//////////////////////////////////////////////////
// Verify vendor ownership before allowing deletion
//////////////////////////////////////////////////
```

BAD:
```js
/////////////////////
// delete service
////////////////////
```

---

# FRONTEND RULES

## UI Philosophy

The UI should feel:
- modern
- breathable
- structured
- visually balanced

Avoid:
- excessive whitespace
- oversized cards
- cramped layouts
- inconsistent spacing
- random colors
- random animations

---

## Section Layout Rules

Sections should:
- span full width
- have distinct backgrounds where necessary
- use inner constrained containers

Pattern:
```jsx
<section className="w-full bg-gray-50">
  <div className="max-w-7xl mx-auto px-4">
    ...
  </div>
</section>
```

---

## Vertical Spacing

Avoid giant empty gaps between sections.

Preferred section spacing:
- py-12
- py-16
- py-20 maximum

Never create awkward floating layouts.

---

## Cards

Cards should:
- feel medium-sized
- have soft shadows
- have subtle hover transitions
- maintain consistent height
- use rounded corners
- prioritize images visually

Avoid giant stretched cards.

---

## Buttons

Buttons must:
- feel clickable
- have hover states
- include transition animations
- maintain consistent padding
- follow platform color system

---

## Animations

Animations should:
- feel subtle
- feel smooth
- improve UX

Avoid:
- flashy motion
- excessive bouncing
- distracting effects

Preferred:
- fade-in
- slight translate
- hover lift
- scale transitions

Animation duration:
- 150ms–300ms preferred

---

# NAVIGATION RULES

## Navbar

Navbar must:
- remain fixed/sticky
- remain clean on scroll
- support mobile side navigation
- prioritize important actions

---

## Mobile Navigation

Navigation links:
- Home
- Market
- Dashboard

Should move into:
- side drawer / mobile menu

Authentication buttons:
- Login
- Register

Must remain visible on navbar for guests.

---

# DATA FETCHING RULES

## API Layer

All API requests must use:
- centralized axios instance

Never hardcode URLs inside components.

---

## Loading States

Every data-fetching page MUST include:
- loading state
- error state
- empty state

Never leave blank screens.

---

# LOADING STATE RULES

## Preferred Loading Pattern

Artisan Market uses Skeleton Loaders as the default loading experience.

Avoid:
- generic "Loading..."
- large spinners in page centers
- blank screens
- layout shifting after data loads

Preferred:
- Skeleton cards
- Skeleton text
- Skeleton image placeholders
- Skeleton table rows
- Skeleton dashboard widgets

The loading UI should closely resemble the final layout.

Users should immediately understand what content is loading.

---

## Service Cards

While services load:

- show ServiceCardSkeleton
- maintain final card dimensions
- maintain grid layout

Never collapse the layout while loading.

---

## Vendor Cards

While vendors load:

- show VendorCardSkeleton
- maintain card height consistency

---

## Service Details Page

While service details load:

Display skeletons for:

- image gallery
- title
- rating
- price
- description
- vendor information
- related services

The page layout should remain visible while content loads.

---

## Dashboard Loading

Vendor dashboard should use:

- StatCardSkeleton
- ChartSkeleton
- TableSkeleton
- ServiceCardSkeleton

Never replace an entire dashboard page with a spinner.

---

## Exceptions

Spinners may be used ONLY for:

- button submission states
- form submission states
- small inline actions

Examples:

- Creating service
- Updating profile
- Accepting booking
- Rejecting booking
- Posting review

In these cases:

<button>
  Saving...
</button>

or a small inline spinner is acceptable.

---

## Skeleton Component Rule

If a skeleton pattern is reused more than once:

Extract reusable components.

Examples:

- ServiceCardSkeleton
- VendorCardSkeleton
- ReviewSkeleton
- BookingTableSkeleton
- DashboardCardSkeleton

# UI STABILITY RULE

Loading states must preserve layout dimensions.

The UI should not jump, resize, or shift significantly when data arrives.

Skeleton dimensions should closely match the final rendered component.

## Error Handling

All async operations must:
- use try/catch
- return meaningful errors
- fail gracefully

---

# BACKEND RULES

## Architecture Pattern

Use:
Controller → Service → Prisma

Controllers:
- handle request/response only

Services:
- contain business logic

Prisma:
- database access only

---

## Authentication

Protected routes must:
- verify JWT
- validate ownership
- prevent unauthorized access

Security is a core priority.

---

## Authorization

Only service owners can:
- edit services
- delete services
- manage vendor resources

Never trust frontend authorization alone.

---

## Validation

Always validate:
- req.body
- req.params
- uploaded files
- user ownership

---

# PERFORMANCE RULES

## Queries

Avoid unnecessary database queries.

Use:
- select
- include
- pagination
- limits

where appropriate.

---

## Home Page Rules

Homepage should:
- feel alive
- feel marketplace-driven
- immediately communicate value

Sections:
- Hero
- Categories
- Featured Services
- Featured Vendors
- CTA

Each section should feel visually distinct.

---

## Featured Content Limits

Homepage should display:
- maximum 8 categories
- maximum 8 featured services
- maximum 8 featured vendors

Use:
- slice(0, 8)

unless backend pagination exists.

---

# SERVICE DETAILS PAGE RULES

Service details page should prioritize:
1. images
2. trust
3. booking CTA
4. vendor credibility
5. related services

Layout should feel:
- conversion-focused
- mobile-friendly
- visually balanced

---

# DESIGN CONSISTENCY RULE

Every new feature must visually feel like it belongs to Artisan Market.

Codex should never generate:
- random design systems
- inconsistent spacing
- disconnected layouts
- unrelated UI styles

The platform must evolve as ONE cohesive product.