import { defineWidgetConfig } from "@medusajs/admin-sdk";
import type { AdminOrder, DetailWidgetProps } from "@medusajs/framework/types";
import { Container, Heading, Text } from "@medusajs/ui";

type OrderLineItem = NonNullable<AdminOrder["items"]>[number];

function getMetadataRecord(item: OrderLineItem) {
  return (item.metadata ?? null) as Record<string, unknown> | null;
}

function getCustomSize(metadata?: Record<string, unknown> | null) {
  if (typeof metadata?.custom_size === "string" && metadata.custom_size.trim()) {
    return metadata.custom_size.trim();
  }

  const width = typeof metadata?.width === "string" ? metadata.width.trim() : "";
  const height = typeof metadata?.height === "string" ? metadata.height.trim() : "";

  if (!width || !height) {
    return null;
  }

  return `${width} × ${height}`;
}

function getPricingSize(metadata?: Record<string, unknown> | null) {
  return typeof metadata?.pricing_size === "string" && metadata.pricing_size.trim()
    ? metadata.pricing_size.trim()
    : null;
}

function getSquareFeet(metadata?: Record<string, unknown> | null) {
  return typeof metadata?.size_sqft === "number" ? metadata.size_sqft : null;
}

function getLineTotal(item: OrderLineItem) {
  if (typeof item.total === "number") {
    return item.total;
  }

  return (item.unit_price ?? 0) * (item.quantity ?? 1);
}

function formatMoney(amount: number, currencyCode: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode.toUpperCase(),
    maximumFractionDigits: 2,
  }).format(amount);
}

const OrderCustomSizeWidget = ({
  data: order,
}: DetailWidgetProps<AdminOrder>) => {
  const customItems = order.items.filter((item) => getCustomSize(getMetadataRecord(item)));
  const currencyCode = order.currency_code ?? "usd";

  if (!customItems.length) {
    return <></>;
  }

  return (
    <Container className="divide-y p-0">
      <div className="px-6 py-4">
        <div>
          <Heading level="h2">Order Detail</Heading>
        </div>
      </div>

      <div>
        <div className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,0.55fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b border-ui-border-base px-6 py-3">
          <Text size="xsmall" className="uppercase text-ui-fg-muted">
            Product
          </Text>
          <Text size="xsmall" className="uppercase text-ui-fg-muted">
            Qty
          </Text>
          <Text size="xsmall" className="uppercase text-ui-fg-muted">
            Size
          </Text>
          <Text size="xsmall" className="uppercase text-ui-fg-muted">
            Priced Size
          </Text>
          <Text size="xsmall" className="uppercase text-ui-fg-muted text-right">
            Cost
          </Text>
        </div>

        {customItems.map((item) => {
          const metadata = getMetadataRecord(item);
          const customSize = getCustomSize(metadata);
          const pricingSize = getPricingSize(metadata);
          const sizeSqft = getSquareFeet(metadata);
          const requestedSize = sizeSqft != null ? `${customSize} · ${sizeSqft} sq ft` : customSize;

          return (
            <div
              key={item.id}
              className="grid grid-cols-[minmax(0,1.5fr)_minmax(0,0.55fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-4 border-b border-ui-border-base px-6 py-4 last:border-b-0"
            >
              <div className="min-w-0">
                <Text size="small" weight="plus">
                  {item.product_title ?? item.title ?? "Order item"}
                </Text>
              </div>
              <Text size="small" className="text-ui-fg-base">
                {item.quantity ?? 1}
              </Text>
              <Text size="small" className="text-ui-fg-base">
                {requestedSize}
              </Text>
              <Text size="small" className="text-ui-fg-base">
                {pricingSize ?? "—"}
              </Text>
              <Text size="small" weight="plus" className="text-right">
                {formatMoney(getLineTotal(item), currencyCode)}
              </Text>
            </div>
          );
        })}
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "order.details.before",
});

export default OrderCustomSizeWidget;
