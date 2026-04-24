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
- **Loyalty Rewards** — Overview of the points/rewards program
- **Price Match Guarantee** — Section explaining the price match policy
- **Amazon Banner** — Cross-promotion banner linking to Amazon storefront
- **Restock Notification** — Email alert signup when item is out of stock

### 🗂️ Other Storefront Pages

| Membership | `/membership` | Membership tiers, perks, and signup |
---

## 2. Shopping & Cart

### 🛒 Cart Page (`/cart`)
- Full cart item list with quantity adjusters and remove buttons
- **Bulk Discount Banner** — Shows tiered discount thresholds (e.g., "Add 2 more for 10% off")
- **Save for Later** — Move items out of cart without deleting them
- **Cart Recommendations** — AI-style "You might also like" product suggestions

### 💳 Checkout (`/cart` → Checkout View)
- Multi-step checkout flow (Shipping → Payment → Review)
- Stripe payment integration
- Address form with validation
- Order review before final submission

### ✅ Order Confirmation (`/order-confirmation`)
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

> Access via Medusa (commerce) dashboard 

### 📊 Dashboard 
- KPI cards: Total Revenue, Orders Today, Active Customers, Low Stock Alerts
- **Monthly Revenue Chart** — Line/bar chart of revenue over time
- **Monthly Units Sold Chart** — Units sold trend
- **Category Sales Chart** — Revenue breakdown by product category
- **Revenue by Product Chart** — Top-performing products
- **Customer Geography Map** — Heatmap of customer locations
- **Team Roles Widget** — Overview of admin team members and roles
- **Backup Widget** — Manual and scheduled database backup controls

### 📦 Orders 
- Full order list with search, filter by status, date range picker
- Bulk actions (mark shipped, export, send email)
- **Order Detail Page**:
  - Overview tab: customer info, order summary, payment status
  - Items tab: line items with images, quantities, prices
  - Shipment tab: tracking number, carrier, shipping label generation
  - Communications tab: email thread history for this order
- **Shipping Label Modal** — Generate and print shipping labels
- **Email Template Editor** — Customize transactional email templates per order

### 🪟 Products 
- Product list with search, filter by category/stock status
- Add / Edit / Delete products via modal form
- **Bulk Restock Modal** — Update stock levels for multiple products at once
- **Low Stock Alert Settings** — Configure threshold for low stock warnings
- **Product Detail Page**:
  - Product info card with full specs
  - Preview tab: live product card preview
  - Restock history tab: log of all stock changes

### 👥 Customers 
- Customer list with search and filter
- **Customer Detail Drawer** — Quick-view panel without leaving the list
- **Customer Detail Page**:
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

### 📬 Email Alerts
- Configure automated email triggers (low stock, new order, restock, etc.)
- Enable/disable individual alert types

### ⭐ Reviews 
- View and moderate customer product reviews
- Approve, reject, or flag reviews
- Reply to reviews

### 🔄 Restock Requests
- List of customer restock notification requests
- Mark as fulfilled when item is back in stock

### 📜 Restock History
- Full log of all inventory restocking events

### 👁️ Visitors
- Real-time and historical site visitor analytics
- Page views, session duration, traffic sources

### 👤 Users
- Manage registered customer accounts
- View, search, deactivate users

### 🔐 Admins
- Manage admin team members
- Assign roles and permissions

### ✉️ Invite 
- Send team invitations via email link

### ⚙️ Settings
- System-wide configuration (store name, currency, timezone, etc.)
- Notification settings
- Backup and restore options

### 👤 Admin Profile
- Personal profile for the logged-in admin
- Activity log tab showing recent admin actions

---

### 💳 Stripe
- Secure checkout session creation
- Payment webhook handling for order confirmation
- Connected via Supabase Edge Functions (keys never exposed to frontend)


## 6. Global UI Components

### 🧩 Feature Components (used across multiple pages)
| Component | Description |
|-----------|-------------|
| `AbandonedCartBanner` | Reminds returning visitors of items left in cart |
| `CallbackWidget` | Request a callback from sales/support |
| `OrderStatusBanner` | Shows active order status at top of page |

### 🛒 Product Card Features (all cards across the site)
- Permanent "Add to Cart" pill button at bottom-right of product image
- **3-state cart interaction:**
  1. Default → "Add to Cart" button visible
  2. Click → Inline qty stepper (− qty + 🛒) expands on the image
  3. Confirm → "Added!" confirmation, then navigates to cart
- Wishlist heart button (top-right of image, always visible)
- Quick View button on hover (center of image)
- Compare toggle button

