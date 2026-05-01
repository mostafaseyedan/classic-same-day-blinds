import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260424120000 extends Migration {
  async up(): Promise<void> {
    this.addSql(`
      create table if not exists "product_review" (
        "id" text not null,
        "product_id" text not null,
        "customer_id" text not null,
        "customer_email" text null,
        "author_name" text null,
        "rating" numeric not null,
        "title" text not null,
        "content" text not null,
        "status" text check ("status" in ('published', 'hidden')) not null default 'published',
        "created_at" timestamptz not null default now(),
        "updated_at" timestamptz not null default now(),
        "deleted_at" timestamptz null,
        constraint "product_review_pkey" primary key ("id")
      );
    `);
    this.addSql('create index if not exists "IDX_product_review_product_id" on "product_review" ("product_id") where deleted_at is null;');
    this.addSql('create index if not exists "IDX_product_review_customer_id" on "product_review" ("customer_id") where deleted_at is null;');
    this.addSql('create index if not exists "IDX_product_review_status" on "product_review" ("status") where deleted_at is null;');
    this.addSql('create index if not exists "IDX_product_review_deleted_at" on "product_review" ("deleted_at");');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "product_review" cascade;');
  }
}
