import { MedusaService } from "@medusajs/framework/utils";

import { ProductReview } from "./models";

class ProductReviewModuleService extends MedusaService({
  ProductReview,
}) {}

export default ProductReviewModuleService;
