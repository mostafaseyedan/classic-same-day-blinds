import fs from "node:fs/promises";
import path from "node:path";

import type { ExecArgs } from "@medusajs/framework/types";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";

type ProductRecord = {
  id?: string;
  title?: string;
  subtitle?: string | null;
  handle?: string;
  status?: string;
  description?: string | null;
  collection_id?: string | null;
  type_id?: string | null;
  created_at?: string | Date;
  updated_at?: string | Date;
  variants?: Array<{
    id?: string;
    title?: string;
    sku?: string | null;
    inventory_quantity?: number | null;
    prices?: Array<{
      amount?: number | null;
      currency_code?: string | null;
    }>;
  }>;
};

function csvCell(value: unknown) {
  const normalized =
    value === null || value === undefined
      ? ""
      : value instanceof Date
        ? value.toISOString()
        : String(value);

  return `"${normalized.replace(/"/g, "\"\"")}"`;
}

function toCsv(rows: Array<Record<string, unknown>>) {
  if (!rows.length) {
    return "";
  }

  const headers = Object.keys(rows[0]);
  const lines = [
    headers.map(csvCell).join(","),
    ...rows.map((row) => headers.map((header) => csvCell(row[header])).join(",")),
  ];

  return `${lines.join("\n")}\n`;
}

export default async function exportProducts({ container, args }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const productModule = container.resolve(Modules.PRODUCT) as {
    listProducts: (
      filters?: Record<string, unknown>,
      config?: Record<string, unknown>,
    ) => Promise<ProductRecord[]>;
  };

  const outputArg = args.find((arg) => arg.startsWith("--output="));
  const outputPath = outputArg
    ? path.resolve(process.cwd(), outputArg.slice("--output=".length))
    : path.resolve(process.cwd(), "exports/products.csv");

  const pageSize = 250;
  const products: ProductRecord[] = [];
  let skip = 0;

  for (;;) {
    const batch = await productModule.listProducts(
      {},
      {
        take: pageSize,
        skip,
        relations: ["variants", "variants.prices"],
        order: {
          created_at: "ASC",
        },
      },
    );

    products.push(...batch);

    if (batch.length < pageSize) {
      break;
    }

    skip += pageSize;
  }

  const rows = products.flatMap((product) => {
    const variants = product.variants?.length ? product.variants : [{}];

    return variants.map((variant) => ({
      product_id: product.id ?? "",
      product_title: product.title ?? "",
      product_subtitle: product.subtitle ?? "",
      handle: product.handle ?? "",
      status: product.status ?? "",
      description: product.description ?? "",
      collection_id: product.collection_id ?? "",
      type_id: product.type_id ?? "",
      variant_id: variant.id ?? "",
      variant_title: variant.title ?? "",
      sku: variant.sku ?? "",
      inventory_quantity: variant.inventory_quantity ?? "",
      prices: JSON.stringify(
        (variant.prices ?? []).map((price) => ({
          currency_code: price.currency_code ?? "",
          amount: price.amount ?? "",
        })),
      ),
      created_at: product.created_at ?? "",
      updated_at: product.updated_at ?? "",
    }));
  });

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, toCsv(rows), "utf8");

  logger.info(`Exported ${rows.length} rows from ${products.length} products to ${outputPath}`);
}
