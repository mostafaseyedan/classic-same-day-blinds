import { Migration } from "@medusajs/framework/mikro-orm/migrations";

export class Migration20260429120000 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "product_review" add column if not exists "merchant_reply" text null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "product_review" drop column if exists "merchant_reply";');
  }
}
