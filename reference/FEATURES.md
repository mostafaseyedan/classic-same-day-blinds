# Web App Features Documentation

> **Last Updated:** April 6, 2026  
> A complete reference of all features across the storefront, customer account, and admin panel.

---

## Table of Contents

1. [Storefront — Public Pages](#1-storefront--public-pages)
2. [Shopping & Cart](#2-shopping--cart)
3. [Customer Account](#3-customer-account)
4. [Admin Panel](#4-admin-panel)
5. [Integrations & Backend Services](#5-integrations--backend-services)
6. [Global UI Components](#6-global-ui-components)

---

## 1. Storefront — Public Pages

### 🏠 Home Page (`/`)
- **Hero Section** — Full-width background image with headline, CTA buttons, and dark overlay for readability
- **Same-Day Delivery Banner** — Promotional strip highlighting same-day delivery availability
- **Featured Products** — Hero card + 3 smaller cards with permanent "Add to Cart" button on image
- **Product Grid** — Filterable product listing with quick-add cart buttons
- **Shop by Room** — Category navigation organized by room type (Living Room, Bedroom, Office, etc.)
- **Categories** — Visual category tiles for browsing by product type
- **Before & After Gallery** — Side-by-side transformation photo gallery
- **Photo Gallery** — Lifestyle imagery showcase
- **Comparison Table** — Feature-by-feature product comparison chart
- **Client Stories** — Customer testimonials and success stories
- **Who We Work With** — B2B client logos and partnership highlights
- **Loyalty Rewards** — Overview of the points/rewards program
- **Price Match Guarantee** — Section explaining the price match policy
- **Amazon Banner** — Cross-promotion banner linking to Amazon storefront
- **Years in Business** — Trust-building milestone counter
- **About Section** — Company background and mission
- **Business Info** — Contact details, hours, and location
- **FAQ Section** — Expandable frequently asked questions
- **Contact Form** — Customer inquiry submission form
- **Footer** — Site links, social media, newsletter signup, legal links
- **Navbar** — Sticky top navigation with search, cart, account, and wishlist icons
- **Search Dropdown** — Live search with product suggestions
- **Track Order Widget** — Inline order tracking by order number
- **Chat Popup** — Live chat / support chat widget

### 🛍️ Products Catalog (`/products`)
- Full product grid with filtering and sorting
- Product cards with permanent cart button at bottom-right of image
- Inline quantity selector (− qty +) before adding to cart
- Wishlist heart button on each card
- Quick View modal for product preview without leaving the page
- Compare toggle to add products to the comparison bar

### 📦 Product Detail Page (`/product/:id`)
- Full product image gallery with thumbnail navigation
- `object-contain` image display — full product visible, no cropping
- Color / finish selector
- Mount type selector (Inside Mount / Outside Mount)
- **Dimension Selector** — Width and height input with real-time price calculation
- Quantity selector
- Add to Cart button (primary)
- **Sticky Bottom Cart Bar** — Slides up when the main cart button scrolls out of view; shows thumbnail, name, price, qty stepper, and cart button
- Product description and specifications tabs
- Customer reviews section
- **Frequently Bought Together** — Bundled product suggestions
- **Restock Notification** — Email alert signup when item is out of stock
- Related products section

### 🗂️ Other Storefront Pages
| Page | URL | Description |
|------|-----|-------------|
| How to Measure | `/how-to-measure` | Step-by-step measuring guide with diagrams |
| Free Sample | `/free-sample` | Request free fabric/material samples |
| Same-Day Delivery | `/same-day-delivery` | Info page for same-day delivery service |
| Track Order | `/track-order` | Public order tracking by order number or email |
| Room Visualizer | `/room-visualizer` | Upload a room photo and preview blinds/shades in it |
| Membership | `/membership` | Membership tiers, perks, and signup |
| Conferences | `/conferences` | B2B conference and trade show information |
| Wishlist | `/wishlist` | Saved products list |
| Order Confirmation | `/order-confirmation` | Post-purchase confirmation page |
| Privacy Policy | `/privacy-policy` | Legal privacy policy document |
| Auth | `/auth` | Login and registration page |

---

## 2. Shopping & Cart

### 🛒 Cart Page (`/cart`)
- Full cart item list with quantity adjusters and remove buttons
- **Bulk Discount Banner** — Shows tiered discount thresholds (e.g., "Add 2 more for 10% off")
- **Save for Later** — Move items out of cart without deleting them
- **Recently Viewed in Cart** — Shows products the customer browsed recently
- **Cart Recommendations** — AI-style "You might also like" product suggestions
- Order summary with subtotal, discounts, shipping estimate, and total
- Proceed to Checkout button

### 💳 Checkout (`/cart` → Checkout View)
- Multi-step checkout flow (Shipping → Payment → Review)
- Stripe payment integration
- Address form with validation
- Order review before final submission

### ✅ Order Confirmation (`/order-confirmation`)
- Order number and summary display
- Estimated delivery date
- Links to track order and continue shopping

---

## 3. Customer Account

### 👤 Account Page (`/account`)
- **Profile Overview** — Name, email, avatar, edit profile modal
- **Order History** — List of past orders with status badges and detail modal
- **Order Detail Modal** — Full breakdown of any past order (items, shipping, invoice)
- **Address Manager** — Add, edit, delete saved shipping addresses
- **Payment Manager** — Saved payment methods management
- **Favorite Products** — Saved/wishlisted items
- **Loyalty Rewards** — Points balance, tier status, redemption history
- **Referral Program** — Unique referral link, referral tracking, reward status
- **Notification Preferences** — Toggle email/SMS notifications by category
- **Notification Frequency** — Set how often to receive marketing emails
- **Notification Activity Log** — History of all notifications sent
- **Purchase by Location** — Map/chart of where orders were shipped
- **Restock Request Form** — Request notification when an out-of-stock item returns

### 📋 Order History (`/orders`)
- Standalone order history page
- Filter by status (Pending, Processing, Shipped, Delivered, Cancelled)
- Search by order number or product name

---

## 4. Admin Panel

> Access via `/admin` — requires admin login at `/admin/login`

### 📊 Dashboard (`/admin/dashboard`)
- KPI cards: Total Revenue, Orders Today, Active Customers, Low Stock Alerts
- **Monthly Revenue Chart** — Line/bar chart of revenue over time
- **Monthly Units Sold Chart** — Units sold trend
- **Category Sales Chart** — Revenue breakdown by product category
- **Revenue by Product Chart** — Top-performing products
- **Customer Geography Map** — Heatmap of customer locations
- **Team Roles Widget** — Overview of admin team members and roles
- **Backup Widget** — Manual and scheduled database backup controls

### 📦 Orders (`/admin/orders`)
- Full order list with search, filter by status, date range picker
- Bulk actions (mark shipped, export, send email)
- **Order Detail Page** (`/admin/orders/:id`):
  - Overview tab: customer info, order summary, payment status
  - Items tab: line items with images, quantities, prices
  - Shipment tab: tracking number, carrier, shipping label generation
  - Communications tab: email thread history for this order
- **Shipping Label Modal** — Generate and print shipping labels
- **Email Template Editor** — Customize transactional email templates per order

### 🪟 Products (`/admin/products`)
- Product list with search, filter by category/stock status
- Add / Edit / Delete products via modal form
- **Bulk Restock Modal** — Update stock levels for multiple products at once
- **Low Stock Alert Settings** — Configure threshold for low stock warnings
- **Product Detail Page** (`/admin/products/:id`):
  - Product info card with full specs
  - Preview tab: live product card preview
  - Restock history tab: log of all stock changes

### 👥 Customers (`/admin/customers`)
- Customer list with search and filter
- **Customer Detail Drawer** — Quick-view panel without leaving the list
- **Customer Detail Page** (`/admin/customers/:id`):
  - Overview tab: contact info, lifetime value, tags
  - Orders tab: all orders for this customer
  - Shipments tab: delivery history
  - Locations tab: shipping address map
  - Promotions tab: discounts and coupons applied
  - Activity tab: full interaction timeline
- **Create Order Modal** — Place a manual order on behalf of a customer
- **Log Call Modal** — Record a phone call interaction
- **Add Note Modal** — Attach internal notes to a customer record
- **Send Email Modal** — Compose and send a direct email to a customer

### 🏢 Companies (`/admin/companies`)
- B2B company account management
- **Company Detail Page** (`/admin/companies/:id`):
  - Overview, Orders, Customers, Shipments, Contracts, Activity tabs
- Add Note and Log Call modals per company

### 🏭 Suppliers (`/admin/suppliers`)
- Supplier directory with contact info
- Add / Edit supplier form modal
- **Supplier Emails Modal** — View email history with a supplier

### 📋 Purchase Orders (`/admin/purchase-orders`)
- Create and manage purchase orders to suppliers
- Status tracking (Draft, Sent, Received, Cancelled)
- Purchase Order form modal

### 💰 Competitor Pricing (`/admin/competitor-pricing`)
- Side-by-side pricing comparison with competitors
- **Claude AI Match Agent** — AI-powered product matching across competitor catalogs
- **Size Breakdown Table** — Price comparison by product dimensions
- **Competitor Alert Modal** — Set alerts when a competitor drops below your price
- Export menu (CSV, PDF)

### 📬 Email Alerts (`/admin/email-alerts`)
- Configure automated email triggers (low stock, new order, restock, etc.)
- Enable/disable individual alert types

### ⭐ Reviews (`/admin/reviews`)
- View and moderate customer product reviews
- Approve, reject, or flag reviews
- Reply to reviews

### 🔄 Restock Requests (`/admin/restock-requests`)
- List of customer restock notification requests
- Mark as fulfilled when item is back in stock

### 📜 Restock History (`/admin/restock-history`)
- Full log of all inventory restocking events

### 👁️ Visitors (`/admin/visitors`)
- Real-time and historical site visitor analytics
- Page views, session duration, traffic sources

### 👤 Users (`/admin/users`)
- Manage registered customer accounts
- View, search, deactivate users

### 🔐 Admins (`/admin/admins`)
- Manage admin team members
- Assign roles and permissions

### ✉️ Invite (`/admin/invite`)
- Send team invitations via email link

### ⚙️ Settings (`/admin/settings`)
- System-wide configuration (store name, currency, timezone, etc.)
- Notification settings
- Backup and restore options

### 👤 Admin Profile (`/admin/profile`)
- Personal profile for the logged-in admin
- Activity log tab showing recent admin actions

### 💬 Messaging Hub (Admin Layout)
- **Team Chat Panel** — Group chat for the admin team
- **Direct Message Panel** — 1-on-1 messaging between admins
- **Group Chat Area** — Multi-person group conversations
- **Notifications Panel** — In-app notification center
- **Admin Team Drawer** — Quick access to team member list and status

---

## 5. Integrations & Backend Services

### 🔌 Supabase
- **Authentication** — User login, registration, session management
- **Database** — Orders, customers, products, reviews, notifications, messages, backups
- **Real-time** — Live team chat and direct messages via Supabase Realtime
- **Row Level Security (RLS)** — Enforced on all tables to prevent unauthorized access

### ⚡ Supabase Edge Functions
| Function | Purpose |
|----------|---------|
| `send-order-email` | Sends transactional order emails via Resend |
| `stripe-checkout` | Creates Stripe checkout sessions |
| `stripe-payment-webhook` | Handles Stripe payment confirmation webhooks |
| `google-reviews` | Fetches Google Business reviews |
| `claude-product-matcher` | AI-powered competitor product matching via Claude API |
| `daily-backup` | Scheduled daily database backup to storage |

### 💳 Stripe
- Secure checkout session creation
- Payment webhook handling for order confirmation
- Connected via Supabase Edge Functions (keys never exposed to frontend)

### 🤖 Claude AI
- Competitor product matching in the admin pricing tool
- Identifies equivalent products across competitor catalogs

---

## 6. Global UI Components

### 🧩 Feature Components (used across multiple pages)
| Component | Description |
|-----------|-------------|
| `AbandonedCartBanner` | Reminds returning visitors of items left in cart |
| `BackToTop` | Floating button to scroll back to top of page |
| `CallbackWidget` | Request a callback from sales/support |
| `CompareBar` | Sticky bottom bar showing products selected for comparison |
| `CompareModal` | Side-by-side product comparison modal |
| `OrderStatusBanner` | Shows active order status at top of page |
| `QuickViewModal` | Product quick-view overlay without navigating away |
| `RecentlyViewedDrawer` | Slide-out drawer of recently browsed products |
| `WishlistButton` | Reusable heart toggle button for wishlisting products |

### 🛒 Product Card Features (all cards across the site)
- Permanent "Add to Cart" pill button at bottom-right of product image
- **3-state cart interaction:**
  1. Default → "Add to Cart" button visible
  2. Click → Inline qty stepper (− qty + 🛒) expands on the image
  3. Confirm → "Added!" confirmation, then navigates to cart
- Wishlist heart button (top-right of image, always visible)
- Quick View button on hover (center of image)
- Compare toggle button

### 🎨 Design System
- **Style:** Minimalism with clean typography
- **Colors:** Green primary accent, white/light backgrounds, no blue or purple
- **Fonts:** Distinctive Google Fonts
- **Animations:** Smooth transitions on cart interactions, sticky bars, modals
- **Responsive:** Desktop-first with full mobile breakpoints
- **Icons:** Remix Icon + Font Awesome (via CDN)
- **Images:** Stable Diffusion generated product/lifestyle imagery

---

*This document covers all features as of version 467 (April 6, 2026).*
