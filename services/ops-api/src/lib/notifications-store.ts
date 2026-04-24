import type { NotificationKind, NotificationRecord, NotificationStatus } from "@blinds/types";

import { opsApiEnv } from "../config.js";
import { getOpsDbPool } from "./db.js";

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
    failureReason: row.failure_reason ?? undefined,
  };
}

export async function initNotificationsStore() {
  const pool = getOpsDbPool();

  await pool.query(`
    create schema if not exists ops;

    create table if not exists ops.notifications (
      id text primary key,
      kind text not null,
      to_email text not null,
      subject text not null,
      html text not null,
      status text not null default 'pending',
      created_at timestamptz not null default now(),
      processed_at timestamptz null,
      failure_reason text null
    );
  `);
}

export async function enqueueNotification(input: {
  id: string;
  kind: NotificationKind;
  toEmail: string;
  subject: string;
  html: string;
}) {
  const pool = getOpsDbPool();

  await pool.query(
    `
      insert into ops.notifications (id, kind, to_email, subject, html, status)
      values ($1, $2, $3, $4, $5, 'pending')
      on conflict (id) do update set
        subject = excluded.subject,
        html = excluded.html,
        status = 'pending',
        processed_at = null,
        failure_reason = null
      where ops.notifications.status = 'failed'
    `,
    [input.id, input.kind, input.toEmail.toLowerCase(), input.subject, input.html],
  );
}

export async function listNotifications(limit = 25): Promise<NotificationRecord[]> {
  const pool = getOpsDbPool();
  const result = await pool.query<NotificationRow>(
    `
      select id, kind, to_email, subject, html, status, created_at, processed_at, failure_reason
      from ops.notifications
      order by created_at desc
      limit $1
    `,
    [limit],
  );

  return result.rows.map(mapNotification);
}

export async function listNotificationsByEmail(
  email: string,
  limit = 25,
): Promise<NotificationRecord[]> {
  const pool = getOpsDbPool();
  const result = await pool.query<NotificationRow>(
    `
      select id, kind, to_email, subject, html, status, created_at, processed_at, failure_reason
      from ops.notifications
      where lower(to_email) = lower($1)
      order by created_at desc
      limit $2
    `,
    [email, limit],
  );

  return result.rows.map(mapNotification);
}

async function getPendingNotifications(limit = 10): Promise<NotificationRecord[]> {
  const pool = getOpsDbPool();
  const result = await pool.query<NotificationRow>(
    `
      select id, kind, to_email, subject, html, status, created_at, processed_at, failure_reason
      from ops.notifications
      where status = 'pending'
      order by created_at asc
      limit $1
    `,
    [limit],
  );

  return result.rows.map(mapNotification);
}

async function markNotification(
  id: string,
  status: NotificationStatus,
  failureReason?: string,
) {
  const pool = getOpsDbPool();

  await pool.query(
    `
      update ops.notifications
      set
        status = $2,
        processed_at = now(),
        failure_reason = $3
      where id = $1
    `,
    [id, status, failureReason ?? null],
  );
}

async function deliverNotification(notification: NotificationRecord) {
  if (!opsApiEnv.resendApiKey) {
    console.log("[ops-api] resend not configured; logging notification instead");
    console.log(
      JSON.stringify(
        {
          id: notification.id,
          kind: notification.kind,
          to: notification.toEmail,
          subject: notification.subject,
        },
        null,
        2,
      ),
    );
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${opsApiEnv.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: opsApiEnv.emailFrom,
      to: notification.toEmail,
      subject: notification.subject,
      html: notification.html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend request failed with ${response.status}`);
  }
}

export async function processPendingNotifications(limit = 10) {
  const pending = await getPendingNotifications(limit);

  for (const notification of pending) {
    try {
      await deliverNotification(notification);
      await markNotification(notification.id, "sent");
    } catch (error) {
      await markNotification(
        notification.id,
        "failed",
        error instanceof Error ? error.message : "Notification delivery failed",
      );
    }
  }

  return {
    processed: pending.length,
  };
}
