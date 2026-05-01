import { defineMiddlewares, authenticate } from "@medusajs/medusa";

export default defineMiddlewares({
  routes: [
    {
      matcher: "/admin/variants*",
      middlewares: [authenticate("user", ["bearer", "session"])],
    },
    {
      matcher: "/admin/customer-account*",
      middlewares: [authenticate("user", ["bearer", "session"])],
    },
    {
      matcher: "/admin/product-reviews*",
      middlewares: [authenticate("user", ["bearer", "session"])],
    },
    {
      matcher: "/store/customers/me/orders*",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
    {
      matcher: "/store/products/*/reviews",
      method: "POST",
      middlewares: [authenticate("customer", ["bearer", "session"])],
    },
  ],
});
