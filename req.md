o	What I want to have on the website on the back end 
o	Orders
o	Products
o	Customers 
o	Companies 
o	Purchase orders
o	Competitor pricing 
o	Visit to the website 
o	Users that have signed up and have an account 
o	Our google reviews 
o	Email alerts with purchase and admin receives them 
o	Admins
o	I want customers to have their own account like we have on the front end and have an account like amazon has where customers can see their orders, cards on file 
o	When a customer checks out we need the ability to let them send a invoice (lets keep everything we have on the checkout process on the front end 
o	
Software That I want intergrated 
•	Saleor
•	Readdy marketing site
•	Saleor catalog + checkout\
•	mailflow
•	Stripe integration
•	account signup
•	CRM contacts/leads
•	basic admin dashboard
•	https://cintrico.com/workspace/organization
•	https://www.pipedrive.com/en/products/email-marketing-software
•	https://www.xero.com/us/
•	Amazon account 
•	Google ads 

Frontend
•	Readdy → marketing website
•	Next.js → storefront + customer accounts
•	React → admin dashboard
________________________________________
Backend
•	Saleor → ecommerce engine
•	Node.js (TypeScript) → custom backend
•	PostgreSQL → database
•	Redis → caching + queues
•	Stripe → payments
•	Resend / SES → email sending
•	PostHog → analytics

.
Use Saleor as the system of record for:
•	products
•	variants
•	pricing
•	channels
•	carts/checkouts
•	orders
•	customers
•	permissions around commerce operations
•	Saleor: commerce backend
•	:MCP servor 
•	Readdy: marketing site and static front-end pages
•	Next.js storefront/customer app: actual buying/account experience
•	Stripe app: payments
•	Custom marketing app: campaigns, flows, CRM sync
•	Postgres: marketing DB
•	PostHog or warehouse: analytics
•	Redis/Valkey + Celery: async processing
•	S3-compatible storage: assets/media
•	Saleor: commerce backend
•	Readdy: marketing site and static front-end pages
•	Next.js storefront/customer app: actual buying/account experience
•	Stripe app: payments
•	Custom marketing app: campaigns, flows, CRM sync
•	Postgres: marketing DB
•	PostHog or warehouse: analytics
•	Redis/Valkey + Celery: async processing
•	S3-compatible storage: assets/media


Build all custom logic as Saleor Apps:
•	Payments app
•	Tax app
•	Shipping/rates app
•	Email/notification app
•	CRM sync app
•	Marketing automation app
•	Analytics/event forwarding app


MailFlow Commerce is a platform that combines:
•	online store management
•	checkout and order processing
•	customer profiles
•	email campaigns
•	automation flows
•	revenue analytics
•	internal admin tools



1. Project Goal
We are building a platform that combines:
•	ecommerce
•	customer accounts
•	CRM
•	email marketing
•	automation
•	analytics
•	admin tools
The goal is to create a system that works like Shopify + Mailchimp combined, with a custom admin dashboard and customer account area.
________________________________________
2. What We Need Built
Frontend
We need three main frontend experiences:
Marketing Website
This is the public site for:
•	homepage
•	pricing
•	features
•	SEO pages
•	lead capture forms
•	signup
Recommended tool: Readdy
________________________________________
Storefront / Customer Portal
This is where customers:
•	browse products
•	add to cart
•	checkout
•	log into their account
•	view orders
•	manage saved cards
•	request invoices
This should feel similar to an Amazon-style account area.
Recommended tool: Next.js
________________________________________
Internal Admin Dashboard
This is for our internal team to manage the business.
It should include:
•	dashboard
•	orders
•	products
•	customers
•	companies
•	campaigns
•	automations
•	analytics
•	reviews
•	settings
•	admin users
Recommended tool: React
________________________________________
3. Recommended Software Stack
Frontend
•	Readdy for marketing website
•	Next.js for storefront and customer accounts
•	React for internal admin dashboard
Backend
•	Saleor for ecommerce engine
•	Node.js / TypeScript for custom backend logic
•	PostgreSQL for application database
•	Redis for caching and background jobs
•	Stripe for payments
•	Resend / SES / Postmark for email sending
•	PostHog for analytics
________________________________________
4. Core Platform Decision
Use Saleor as the commerce engine
Saleor should be the system of record for:
•	products
•	variants
•	pricing
•	channels
•	carts
•	checkout
•	orders
•	customers
•	promotions
•	shipping
•	inventory
•	commerce permissions
Do not use Saleor for:
•	CRM
•	campaign builder
•	automation workflows
•	admin reporting
•	company accounts
•	competitor pricing
•	Google reviews
•	attribution dashboards
Those should be built in a separate custom backend.
________________________________________



5. Main Features Required
Ecommerce
We need the backend to support:
•	products
•	product variants
•	product pricing
•	inventory
•	orders
•	checkout
•	shipping
•	discounts
•	purchase orders
•	competitor pricing field
________________________________________
Customers
We need:
•	user signup/login
•	customer accounts
•	account dashboard
•	order history
•	cards on file
•	invoice request option at checkout
•	saved addresses
•	companies / B2B support
________________________________________
CRM
We need to manage:
•	leads
•	contacts
•	companies
•	notes
•	tags
•	lifecycle stage
•	assignment rules
________________________________________
Email / Marketing
We need:
•	campaigns
•	email templates
•	segmentation
•	automations
•	transactional emails
•	email alerts for purchases
•	admin notifications
________________________________________
Analytics
We need to track:
•	website visits
•	signed-up users
•	order revenue
•	campaign performance
•	customer lifetime value
•	traffic sources
•	attribution
________________________________________
Reviews
We need:
•	Google reviews integration
•	review display
•	alerts for new reviews
________________________________________
Admin
We need:
•	admin users
•	roles
•	permissions
•	audit logs
•	system settings
________________________________________
6. Admin Dashboard Screens
6.1 Dashboard
Main summary page with:
•	revenue today
•	orders today
•	email revenue
•	new customers
•	revenue over time
•	orders over time
•	campaign performance
•	recent orders
•	recent signups
•	alerts
________________________________________
6.2 Orders
Should include:
•	order list
•	filters
•	payment status
•	fulfillment status
•	order detail page
•	invoice send/request option
•	event timeline
________________________________________
6.3 Products
Should include:
•	product list
•	add/edit product
•	variants
•	pricing
•	inventory
•	images
•	competitor pricing field
________________________________________
6.4 Customers
Should include:
•	customer list
•	customer profile
•	order history
•	saved cards
•	activity timeline
•	notes
•	tags
________________________________________
6.5 Companies
Should include:
•	company list
•	linked users
•	purchase orders
•	custom pricing
•	company spend totals
________________________________________
6.6 Campaigns
Should include:
•	campaign list
•	status
•	open rate
•	click rate
•	revenue generated
•	email builder
•	templates
•	scheduling
________________________________________
6.7 Automations
Should include:
•	automation list
•	workflow builder
•	triggers
•	delays
•	conditions
•	logs
Examples:
•	welcome flow
•	abandoned cart
•	post-purchase
________________________________________
6.8 Analytics
Should include:
•	revenue by campaign
•	conversion rate
•	customer lifetime value
•	traffic sources
•	top-performing products
•	attribution
________________________________________
6.9 Reviews
Should include:
•	Google review feed
•	overall rating
•	alerts for new reviews
________________________________________
6.10 Settings
Should include:
•	general settings
•	Stripe settings
•	email provider settings
•	API keys
•	domain settings
•	integrations
________________________________________
6.11 Admin Users
Should include:
•	user list
•	roles
•	permissions
•	last login
Roles:
•	Super Admin
•	Admin
•	Marketing
•	Support
________________________________________
7. Architecture Overview
High-Level Structure
[Readdy Marketing Site]
    -> lead forms
    -> signup
    -> pricing pages

[Next.js Storefront / Customer Portal]
    -> products
    -> cart
    -> checkout
    -> customer account
    -> orders
    -> invoice requests

[React Admin Dashboard]
    -> CRM
    -> campaigns
    -> analytics
    -> support
    -> settings

                ↓

            [Custom Backend API]

                ↓

   ├── Saleor (commerce)
   ├── PostgreSQL (app data)
   ├── Stripe (payments)
   ├── Email provider
   ├── PostHog (analytics)
   └── Redis (queues/jobs)
________________________________________
8. Database Ownership
Saleor Database owns:
•	products
•	variants
•	pricing
•	inventory
•	customers
•	checkouts
•	orders
•	discounts
•	shipping
•	fulfillment
Application Database owns:
•	accounts
•	subscriptions
•	leads
•	contacts
•	companies
•	notes
•	tags
•	campaigns
•	email templates
•	automation flows
•	event logs
•	audit logs
•	feature flags
•	settings
•	review data
•	competitor pricing
•	admin users
________________________________________
9. API Responsibilities
Saleor API should handle:
•	products
•	categories
•	collections
•	variants
•	prices
•	customers
•	checkouts
•	orders
•	shipping
•	discounts
Internal Custom API should handle:
•	leads
•	contacts
•	segmentation
•	companies
•	campaigns
•	automation definitions
•	email logs
•	reports
•	admin actions
•	settings
•	review integration
•	competitor pricing
________________________________________
10. Main System Flows
Signup Flow
1.	user signs up from marketing site
2.	account is created
3.	user record is created
4.	default subscription state is created
5.	onboarding automation starts
6.	optional Saleor customer is created
________________________________________
Checkout Flow
1.	storefront pulls products from Saleor
2.	user adds to cart
3.	checkout starts in Saleor
4.	Stripe processes payment
5.	order is created in Saleor
6.	webhook is sent to internal backend
7.	CRM updates customer purchase history
8.	automation starts
9.	analytics records revenue attribution
________________________________________
Lead Flow
1.	form submitted on marketing site
2.	lead created in CRM
3.	duplicate check runs
4.	lead assignment runs
5.	nurture flow starts
6.	lead appears in admin dashboard
________________________________________
Campaign Flow
1.	admin creates campaign
2.	segment is selected
3.	recipients are generated
4.	email provider sends campaign
5.	open/click events return by webhook
6.	analytics updates campaign performance
7.	revenue is attributed if purchase happens
________________________________________
11. Required Integrations
We want these integrations planned for:
•	Saleor
•	Readdy
•	Stripe
•	MailFlow / custom email system
•	CRM contacts/leads
•	Google Ads
•	Google Reviews
•	Xero
•	Amazon account data if relevant
•	Cintrico workspace reference if needed
•	Pipedrive-style email marketing functionality as inspiration
________________________________________
12. Development Recommendation
Recommended build approach
Phase 1
Build first:
•	Readdy marketing site
•	Saleor catalog and checkout
•	Stripe integration
•	customer signup/login
•	customer account dashboard
•	basic CRM
•	basic admin dashboard
Phase 2
Build next:
•	campaigns
•	email templates
•	automation flows
•	analytics events
•	attribution tracking
•	Google reviews integration
•	company accounts / purchase orders
Phase 3
Build later:
•	advanced segmentation
•	deeper reporting
•	Xero integration for invoicing
•	Amazon integration
•	AI features
•	more advanced B2B functions
________________________________________
13. Important Developer Notes
•	Use Saleor only for commerce.
•	Build a separate backend for CRM, campaigns, automation, analytics, companies, and admin features.
•	Keep the customer checkout flow on the frontend, but add support for invoice requests.
•	Customer accounts should feel polished and simple, like Amazon.
•	Admin dashboard should feel like Shopify or Stripe: clean, fast, data-first.
________________________________________
14. Final Developer Summary
We are building a headless ecommerce and marketing SaaS platform.
Tech direction:
•	Saleor = ecommerce engine
•	Readdy = marketing site
•	Next.js = storefront + customer accounts
•	React = admin dashboard
•	Node.js / TypeScript = custom backend
•	PostgreSQL = app database
•	Stripe = payments
•	Redis = queues/jobs
•	PostHog = analytics
•	Email provider = transactional + campaign emails
Deliverable expectation:
A scalable system with:
•	ecommerce
•	customer accounts
•	CRM
•	email campaigns
•	automation
•	analytics
•	internal admin tools
________________________________________

