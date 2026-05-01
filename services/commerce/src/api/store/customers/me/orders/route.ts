import type { AuthenticatedMedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Client } from "pg";

type CustomerAccountOrderItem = {
  id: string;
  title?: string;
  productTitle?: string;
  variantId?: string;
  quantity: number;
  total: number;
};

type CustomerAccountOrder = {
  id: string;
  displayId?: number;
  status: string;
  email: string;
  currencyCode: string;
  total: number;
  createdAt: string;
  items: CustomerAccountOrderItem[];
};

type CustomerAccountOrdersResponse = {
  orders: CustomerAccountOrder[];
};

type CustomerRow = {
  id: string;
  email: string;
};

type OrderItemRow = {
  id: string;
  title: string | null;
  productTitle: string | null;
  variantId: string | null;
  quantity: string | number | null;
  total: string | number | null;
};

type OrderRow = {
  id: string;
  display_id: number | null;
  status: string;
  email: string;
  currency_code: string;
  total: string | number | null;
  created_at: Date;
  items: OrderItemRow[] | null;
};

function toNumber(value: string | number | null): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  return 0;
}

function valueOrUndefined(value: string | null): string | undefined {
  return value ?? undefined;
}

function mapOrder(row: OrderRow): CustomerAccountOrder {
  return {
    id: row.id,
    displayId: row.display_id ?? undefined,
    status: row.status,
    email: row.email,
    currencyCode: row.currency_code,
    total: toNumber(row.total),
    createdAt: row.created_at.toISOString(),
    items: (row.items ?? []).map((item) => ({
      id: item.id,
      title: valueOrUndefined(item.title),
      productTitle: valueOrUndefined(item.productTitle),
      variantId: valueOrUndefined(item.variantId),
      quantity: toNumber(item.quantity),
      total: toNumber(item.total),
    })),
  };
}

export async function GET(
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse<CustomerAccountOrdersResponse | { message: string }>,
) {
  const customerId = req.auth_context?.actor_id?.trim();

  if (!customerId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    return res.status(500).json({ message: "DATABASE_URL is not configured." });
  }

  const client = new Client({ connectionString: databaseUrl });

  try {
    await client.connect();

    const customerResult = await client.query<CustomerRow>(
      `
        select id, email
        from customer
        where id = $1
          and deleted_at is null
        limit 1
      `,
      [customerId],
    );

    const customer = customerResult.rows[0];

    if (!customer) {
      return res.status(404).json({ message: "Customer not found." });
    }

    const customerEmail = customer.email.trim().toLowerCase();
    const ordersResult = await client.query<OrderRow>(
      `
        select
          o.id,
          o.display_id,
          o.status::text as status,
          o.email,
          o.currency_code,
          coalesce(
            summary.totals->>'current_order_total',
            summary.totals->>'original_order_total',
            summary.totals->>'paid_total',
            '0'
          ) as total,
          o.created_at,
          coalesce(items.items, '[]'::json) as items
        from "order" o
        left join lateral (
          select totals
          from order_summary
          where order_id = o.id
            and deleted_at is null
          order by version desc
          limit 1
        ) summary on true
        left join lateral (
          select json_agg(
            json_build_object(
              'id', oi.id,
              'title', li.title,
              'productTitle', li.product_title,
              'variantId', li.variant_id,
              'quantity', coalesce(oi.quantity, 0),
              'total', coalesce(oi.unit_price, li.unit_price, 0) * coalesce(oi.quantity, 0)
            )
            order by oi.created_at asc
          ) as items
          from order_item oi
          left join order_line_item li on li.id = oi.item_id
          where oi.order_id = o.id
            and oi.deleted_at is null
        ) items on true
        where o.deleted_at is null
          and (o.customer_id = $1 or lower(o.email) = $2)
        order by o.created_at desc
        limit 25
      `,
      [customer.id, customerEmail],
    );

    return res.json({
      orders: ordersResult.rows.map(mapOrder),
    });
  } catch (error) {
    console.error("Failed to load storefront customer orders", error);
    return res.status(500).json({ message: "Unable to load customer orders." });
  } finally {
    await client.end().catch(() => {});
  }
}
