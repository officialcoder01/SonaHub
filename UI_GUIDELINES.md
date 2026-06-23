# UI GUIDELINES — ARTISAN MARKET

# DESIGN IDENTITY

Artisan Market represents:
- local talent
- craftsmanship
- trust
- community
- accessibility

The design language should blend:
- modern marketplace UI
- clean SaaS structure
- human warmth

The platform should feel approachable and trustworthy.

---

# VISUAL STYLE

## Design Tone
- clean
- modern
- elegant
- lightweight
- practical

Avoid:
- overdesigned interfaces
- excessive gradients
- dark aggressive UI
- clutter

---

# COLOR SYSTEM

## Primary Color
Use a strong modern blue for:
- CTAs
- primary actions
- active states

Examples:
- buttons
- active links
- highlights

---

## Neutral Colors
Use soft neutrals:
- white
- gray-50
- gray-100
- gray-200

Avoid harsh contrast.

---

## Accent Colors
Use subtle accent colors ONLY for:
- ratings
- badges
- success states
- featured labels

---

# TYPOGRAPHY

## Headings
Headings should feel:
- bold
- confident
- readable

Avoid oversized hero text.

Preferred:
- text-3xl
- text-4xl
- font-bold

---

## Body Text
Body text should:
- remain readable
- avoid tiny fonts
- use proper line height

Preferred:
- text-sm
- text-base
- leading-relaxed

---

# LAYOUT SYSTEM

## Section Structure

Preferred structure:
```jsx
<section className="w-full py-16">
  <div className="max-w-7xl mx-auto px-4">
    ...
  </div>
</section>
```

---

## Full Width Backgrounds

Section backgrounds should extend fully across the screen.

Inner content should remain constrained.

This creates:
- visual separation
- structure
- rhythm

---

## Container Width

Preferred:
- max-w-7xl

Avoid narrow boxed layouts unless intentional.

---

# HERO SECTION

## Hero Goal

The hero section must immediately communicate:

"Find trusted artisans near you."

Users should instantly understand:
- what the platform is
- who it serves
- what action to take

---

## Hero Layout

Hero should:
- breathe properly
- avoid cramped containers
- prioritize messaging
- include strong CTA buttons

---

## Hero CTA

Preferred CTAs:
- Explore Services
- Become a Vendor

---

# CATEGORY SECTION

## Category Layout

Display:
- maximum 8 categories

Layout:
- 4-column grid on desktop
- 2-column grid on tablet
- 1-column or 2-column on mobile

---

## Category Cards

Category cards should:
- feel compact
- clickable
- clean
- icon-friendly

Avoid giant cards.

---

# SERVICE CARD GUIDELINES

## Service Cards Must Include
- image
- service name
- category
- location/vendor
- price if available
- CTA button

---

## Card Sizing
Cards should:
- remain medium-sized
- maintain equal heights
- prioritize image visibility

---

## Hover Effects
Preferred:
- slight lift
- soft shadow increase
- smooth transition

Avoid dramatic scaling.

---

# VENDOR CARD GUIDELINES

Vendor cards should include:
- avatar/logo
- business name
- location
- rating
- short description
- view profile button

---

## Vendor Card Feel
Vendor cards should feel:
- trustworthy
- human
- community-based

---

# SECTION DISTINCTION

Every homepage section should feel visually distinct.

Use:
- alternating background colors
- spacing rhythm
- section headers
- subtle borders/dividers

Avoid sections blending together visually.

---

# IMAGE RULES

## Images
Images should:
- load consistently
- maintain aspect ratios
- avoid stretching

Preferred:
- object-cover

---

## Image Priority
Images are critical for marketplace trust.

Service images should dominate visually.

---

# MOBILE EXPERIENCE

## Mobile Priority
The mobile experience is a first-class experience.

Not an afterthought.

---

## Mobile Rules
- stacked layouts
- readable buttons
- large touch targets
- clean spacing
- smooth scrolling

---

# ANIMATION GUIDELINES

Animations should:
- support usability
- feel polished
- remain subtle

Preferred:
- fade-in
- slide-up
- hover lift

Avoid:
- excessive motion
- distracting animations

---

# TRUST & MARKETPLACE FEEL

The platform should constantly reinforce:
- trust
- credibility
- professionalism

This can be achieved through:
- ratings
- vendor info
- clean cards
- consistent spacing
- quality imagery
- clear CTAs

---

# EMPTY STATES

Empty states should:
- feel intentional
- guide the user
- include actions

Example:
"No reviews yet — be the first to review this service."

---

# RESPONSIVE DESIGN PHILOSOPHY

Responsive design is NOT just shrinking elements.

Layouts must adapt intelligently across:
- mobile
- tablet
- desktop

Every page should feel intentionally designed for every screen size.