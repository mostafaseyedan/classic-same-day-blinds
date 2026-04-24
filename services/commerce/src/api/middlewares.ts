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
  ],
});
