import type { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { Client } from "pg";

type NotificationKind = string;
type NotificationStatus = string;

type CustomerOpsRequestRecord = {
  id: string;
  type: "quote" | "invoice" | "restock" | "account_deletion";
  email: string;
  status: string;
  submittedAt: string;
  customerName?: string;
  companyName?: string;
  purchaseOrderNumber?: string;
  cartId?: string;
  orderId?: string;
  customerId?: string;
  productId?: string;
  productName?: string;
  notes?: string;
};

type NotificationRecord = {
  id: string;
  kind: string;
  toEmail: string;
  subject: string;
  html: string;
  status: string;
  createdAt: string;
  processedAt?: string;
  failureReason?: string;
};

type CustomerAccountAdminCustomer = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  phone?: string;
  hasAccount: boolean;
  createdAt: string;
  updatedAt: string;
  metadata: Record<string, unknown>;
};

type CustomerAccountAdminAddress = {
  id: string;
  label?: string;
  company?: string;
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  countryCode?: string;
  phone?: string;
  isDefaultShipping: boolean;
  isDefaultBilling: boolean;
};

type CustomerAccountAdminOrder = {
  id: string;
  displayId?: number;
  status: string;
  email: string;
  currencyCode: string;
  total: number;
  itemCount: number;
  createdAt: string;
};

type CustomerAccountAdminResponse = {
  customer: CustomerAccountAdminCustomer;
  addresses: CustomerAccountAdminAddress[];
  orders: CustomerAccountAdminOrder[];
  requests: CustomerOpsRequestRecord[];
  notifications: NotificationRecord[];
};

type CustomerRow = {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  phone: string | null;
  has_account: boolean;
  metadata: Record<string, unknown> | null;
  created_at: Date;
  updated_at: Date;
};

type AddressRow = {
  id: string;
  address_name: string | null;
  company: string | null;
  first_name: string | null;
  last_name: string | null;
  address_1: string | null;
  address_2: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country_code: string | null;
  phone: string | null;
  is_default_shipping: boolean;
  is_default_billing: boolean;
};

type OrderRow = {
  id: string;
  display_id: number | null;
  status: string;
  email: string;
  currency_code: string;
  total: string | number | null;
  item_count: string | number | null;
  created_at: Date;
};

type RequestRow = {
  id: string;
  type: CustomerOpsRequestRecord["type"];
  email: string;
  status: string;
  submitted_at: Date;
  customer_name: string | null;
  company_name: string | null;
  purchase_order_number: string | null;
  cart_id: string | null;
  order_id: string | null;
  customer_id: string | null;
  product_id: string | null;
  product_name: string | null;
  notes: string | null;
};

type NotificationRow = {
  id: string;
  kind: NotificationKind;
  to_email: string;
  subject: string;
  html: string;
  status: NotificationStatus;
  created_at: Date;
  processed_at: Date | null;
  failure_reason: string | null;
};

function valueOrUndefined(value: string | null): string | undefined {
  return value ?? undefined;
}

function toNumber(value: string | number | null): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value);
  return 0;
}

function mapCustomer(row: CustomerRow): CustomerAccountAdminCustomer {
  return {
    id: row.id,
    email: row.email,
    firstName: valueOrUndefined(row.first_name),
    lastName: valueOrUndefined(row.last_name),
    companyName: valueOrUndefined(row.company_name),
    phone: valueOrUndefined(row.phone),
    hasAccount: row.has_account,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    metadata: row.metadata ?? {},
  };
}

function mapAddress(row: AddressRow): CustomerAccountAdminAddress {
  return {
    id: row.id,
    label: valueOrUndefined(row.address_name),
    company: valueOrUndefined(row.company),
    firstName: valueOrUndefined(row.first_name),
    lastName: valueOrUndefined(row.last_name),
    address1: valueOrUndefined(row.address_1),
    address2: valueOrUndefined(row.address_2),
    city: valueOrUndefined(row.city),
    province: valueOrUndefined(row.province),
    postalCode: valueOrUndefined(row.postal_code),
    countryCode: valueOrUndefined(row.country_code),
    phone: valueOrUndefined(row.phone),
    isDefaultShipping: row.is_default_shipping,
    isDefaultBilling: row.is_default_billing,
  };
}

function mapOrder(row: OrderRow): CustomerAccountAdminOrder {
  return {
    id: row.id,
    displayId: row.display_id ?? undefined,
    status: row.status,
    email: row.email,
    currencyCode: row.currency_code,
    total: toNumber(row.total),
    itemCount: toNumber(row.item_count),
    createdAt: row.created_at.toISOString(),
  };
}

function mapRequest(row: RequestRow): CustomerOpsRequestRecord {
  return {
    id: row.id,
    type: row.type,
    email: row.email,
    status: row.status,
    submittedAt: row.submitted_at.toISOString(),
    customerName: valueOrUndefined(row.customer_name),
    companyName: valueOrUndefined(row.company_name),
    purchaseOrderNumber: valueOrUndefined(row.purchase_order_number),
    cartId: valueOrUndefined(row.cart_id),
    orderId: valueOrUndefined(row.order_id),
    customerId: valueOrUndefined(row.customer_id),
    productId: valueOrUndefined(row.product_id),
    productName: valueOrUndefined(row.product_name),
    notes: valueOrUndefined(row.notes),
  };
}

function mapNotification(row: NotificationRow): NotificationRecord {
  return {
    id: row.id,
    kind: row.kind,
    toEmail: row.to_email,
    subject: row.subject,
    html: row.html,
    status: row.status,
    createdAt: row.created_at.toISOString(),
    processedAt: row.processed_at?.toISOString(),
    failureReason: valueOrUndefined(row.failure_reason),
  };
}

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const customerId = typeof req.query.customer_id === "string" ? req.query.customer_id.trim() : "";
  const email = typeof req.query.email === "string" ? req.query.email.trim().toLowerCase() : "";

  if (!customerId && !email) {
    return res.status(400).json({ message: "customer_id or email is required" });
  }

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();

  try {
    const customerResult = await client.query<CustomerRow>(
      `
        select
          id,
          email,
          first_name,
          last_name,
          company_name,
          phone,
          has_account,
          metadata,
          created_at,
          updated_at
        from customer
        where deleted_at is null
          and ($1::text = '' or id = $1)
          and ($2::text = '' or lower(email) = $2)
        order by created_at desc
        limit 1
      `,
      [customerId, email],
    );

    const customerRow = customerResult.rows[0];

    if (!customerRow) {
      return res.status(404).json({ message: "Customer not found" });
    }

    const customerEmail = customerRow.email.toLowerCase();

    const [addressResult, orderResult, requestResult, notificationResult] = await Promise.all([
      client.query<AddressRow>(
        `
          select
            id,
            address_name,
            company,
            first_name,
            last_name,
            address_1,
            address_2,
            city,
            province,
            postal_code,
            country_code,
            phone,
            is_default_shipping,
            is_default_billing
          from customer_address
          where customer_id = $1
            and deleted_at is null
          order by is_default_shipping desc, created_at desc
        `,
        [customerRow.id],
      ),
      client.query<OrderRow>(
        `
          select *
          from (
            select distinct on (o.id)
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
              coalesce(items.item_count, 0) as item_count,
              o.created_at
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
              select coalesce(sum(quantity), 0) as item_count
              from order_item
              where order_id = o.id
                and deleted_at is null
            ) items on true
            where o.deleted_at is null
              and (o.customer_id = $1 or lower(o.email) = $2)
            order by o.id, o.created_at desc
          ) orders
          order by created_at desc
          limit 25
        `,
        [customerRow.id, customerEmail],
      ),
      client.query<RequestRow>(
        `
          select
            id,
            type,
            email,
            status,
            submitted_at,
            customer_name,
            company_name,
            purchase_order_number,
            cart_id,
            order_id,
            customer_id,
            product_id,
            product_name,
            notes
          from ops.customer_requests
          where lower(email) = $1
          order by submitted_at desc
          limit 25
        `,
        [customerEmail],
      ),
      client.query<NotificationRow>(
        `
          select
            id,
            kind,
            to_email,
            subject,
            html,
            status,
            created_at,
            processed_at,
            failure_reason
          from ops.notifications
          where lower(to_email) = $1
          order by created_at desc
          limit 25
        `,
        [customerEmail],
      ),
    ]);

    const payload: CustomerAccountAdminResponse = {
      customer: mapCustomer(customerRow),
      addresses: addressResult.rows.map(mapAddress),
      orders: orderResult.rows.map(mapOrder),
      requests: requestResult.rows.map(mapRequest),
      notifications: notificationResult.rows.map(mapNotification),
    };

    return res.json(payload);
  } finally {
    await client.end();
  }
}
