# Commerce Service

This workspace is the Medusa commerce core for Phase 1.

Target ownership:

- products
- variants and option structures
- pricing
- carts
- checkout
- orders
- customers
- inventory

Current framework structure:

- `medusa-config.ts` -> environment-driven Medusa bootstrap
- `src/lib/env.ts` -> local Medusa env contract
- `src/bootstrap/catalog-reference.ts` -> first product-family modeling blueprint for import scripts
- `src/scripts/seed.ts` -> repeatable region, API key, and catalog seed script

Next framework steps:

1. expand the catalog import from starter families into the full production catalog
2. connect stock locations and inventory levels for real availability handling
3. add transactional notifications
4. extend admin flows for pricing and inventory operations

Useful commands:

- `npm run db:migrate -w @blinds/commerce`
- `npm run seed:catalog -w @blinds/commerce`
- `npm run dev -w @blinds/commerce`
