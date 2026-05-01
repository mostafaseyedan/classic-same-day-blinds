import { model } from "@medusajs/framework/utils";

export const ProductReviewStatus = {
  PUBLISHED: "published",
  HIDDEN: "hidden",
} as const;

const ProductReview = model
  .define(
    { name: "ProductReview", tableName: "product_review" },
    {
      id: model.id({ prefix: "prev" }).primaryKey(),
      product_id: model.text(),
      customer_id: model.text(),
      customer_email: model.text().nullable(),
      author_name: model.text().nullable(),
      rating: model.number(),
      title: model.text(),
      content: model.text(),
      merchant_reply: model.text().nullable(),
      status: model.enum(Object.values(ProductReviewStatus)).default(ProductReviewStatus.PUBLISHED),
    },
  )
  .indexes([
    {
      name: "IDX_product_review_product_id",
      on: ["product_id"],
      unique: false,
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_product_review_customer_id",
      on: ["customer_id"],
      unique: false,
      where: "deleted_at IS NULL",
    },
    {
      name: "IDX_product_review_status",
      on: ["status"],
      unique: false,
      where: "deleted_at IS NULL",
    },
  ]);

export default ProductReview;
