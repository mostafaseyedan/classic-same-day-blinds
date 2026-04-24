import type {
  CustomerOpsRequestRecord,
  CustomerOpsRequestStatus,
} from "@blinds/types";

import { getOpsDbPool } from "./db.js";

type CustomerRequestRow = {
  id: string;
  type: CustomerOpsRequestRecord["type"];
  email: string;
  status: CustomerOpsRequestStatus;
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

function mapCustomerRequest(row: CustomerRequestRow): CustomerOpsRequestRecord {
  return {
    id: row.id,
    type: row.type,
    email: row.email,
    status: row.status,
    submittedAt: row.submitted_at.toISOString(),
    customerName: row.customer_name ?? undefined,
    companyName: row.company_name ?? undefined,
    purchaseOrderNumber: row.purchase_order_number ?? undefined,
    cartId: row.cart_id ?? undefined,
    orderId: row.order_id ?? undefined,
    customerId: row.customer_id ?? undefined,
    productId: row.product_id ?? undefined,
    productName: row.product_name ?? undefined,
    notes: row.notes ?? undefined,
  };
}

export async function initCustomerRequestsStore() {
  const pool = getOpsDbPool();

  await pool.query(`
    create schema if not exists ops;

    create table if not exists ops.customer_requests (
      id text primary key,
      type text not null,
      email text not null,
      status text not null,
      submitted_at timestamptz not null,
      customer_name text null,
      company_name text null,
      purchase_order_number text null,
      cart_id text null,
      order_id text null,
      customer_id text null,
      product_id text null,
      product_name text null,
      notes text null,
      created_at timestamptz not null default now()
    );

    alter table ops.customer_requests add column if not exists customer_name text null;
    alter table ops.customer_requests add column if not exists company_name text null;
    alter table ops.customer_requests add column if not exists purchase_order_number text null;
    alter table ops.customer_requests add column if not exists cart_id text null;
    alter table ops.customer_requests add column if not exists order_id text null;
    alter table ops.customer_requests add column if not exists customer_id text null;
    alter table ops.customer_requests add column if not exists product_id text null;
    alter table ops.customer_requests add column if not exists product_name text null;
  `);
}

export async function createCustomerOpsRequest(record: CustomerOpsRequestRecord) {
  const pool = getOpsDbPool();

  await pool.query(
    `
      insert into ops.customer_requests (
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
      ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      on conflict (id) do nothing
    `,
    [
      record.id,
      record.type,
      record.email.toLowerCase(),
      record.status,
      record.submittedAt,
      record.customerName ?? null,
      record.companyName ?? null,
      record.purchaseOrderNumber ?? null,
      record.cartId ?? null,
      record.orderId ?? null,
      record.customerId ?? null,
      record.productId ?? null,
      record.productName ?? null,
      record.notes ?? null,
    ],
  );
}

export async function updateCustomerOpsRequestStatus(
  id: string,
  status: CustomerOpsRequestStatus,
): Promise<CustomerOpsRequestRecord | null> {
  const pool = getOpsDbPool();
  const result = await pool.query<CustomerRequestRow>(
    `
      update ops.customer_requests
      set status = $2
      where id = $1
      returning
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
    `,
    [id, status],
  );

  return result.rows[0] ? mapCustomerRequest(result.rows[0]) : null;
}

export async function listAllCustomerOpsRequests(filters?: {
  type?: CustomerOpsRequestRecord["type"];
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<{ records: CustomerOpsRequestRecord[]; total: number }> {
  const pool = getOpsDbPool();
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filters?.type) {
    params.push(filters.type);
    conditions.push(`type = $${params.length}`);
  }

  if (filters?.status) {
    params.push(filters.status);
    conditions.push(`status = $${params.length}`);
  }

  const where = conditions.length ? `where ${conditions.join(" and ")}` : "";
  const limit = filters?.limit ?? 50;
  const offset = filters?.offset ?? 0;

  const countResult = await pool.query<{ count: string }>(
    `select count(*) as count from ops.customer_requests ${where}`,
    params,
  );

  const dataResult = await pool.query<CustomerRequestRow>(
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
      ${where}
      order by submitted_at desc
      limit ${limit}
      offset ${offset}
    `,
    params,
  );

  return {
    total: parseInt(countResult.rows[0].count, 10),
    records: dataResult.rows.map(mapCustomerRequest),
  };
}

export async function listCustomerOpsRequests(email: string): Promise<CustomerOpsRequestRecord[]> {
  const pool = getOpsDbPool();
  const result = await pool.query<CustomerRequestRow>(
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
      where lower(email) = lower($1)
      order by submitted_at desc
    `,
    [email],
  );

  return result.rows.map(mapCustomerRequest);
}
