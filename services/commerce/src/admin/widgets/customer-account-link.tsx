import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { Button, Container, Heading, Text } from "@medusajs/ui";

type CustomerWidgetData = {
  id: string;
  email?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  company_name?: string | null;
  phone?: string | null;
  has_account?: boolean | null;
};

type CustomerAccountLinkWidgetProps = {
  data: CustomerWidgetData;
};

function fullName(customer: CustomerWidgetData) {
  return [customer.first_name, customer.last_name].filter(Boolean).join(" ") || "No name";
}

const CustomerAccountLinkWidget = ({ data: customer }: CustomerAccountLinkWidgetProps) => {
  const href = `/app/customer-account?customer_id=${encodeURIComponent(customer.id)}`;

  return (
    <Container className="p-6">
      <div className="flex flex-col gap-4">
        <div>
          <Heading level="h2">Customer Account</Heading>
          <Text size="small" className="mt-2 text-ui-fg-subtle">
            Open the consolidated customer account view for profile, orders, requests, and notification activity.
          </Text>
        </div>

        <div className="grid gap-1">
          <Text size="small" weight="plus">
            {fullName(customer)}
          </Text>
          {customer.email ? <Text size="small" className="text-ui-fg-subtle">{customer.email}</Text> : null}
          {customer.company_name ? (
            <Text size="small" className="text-ui-fg-subtle">{customer.company_name}</Text>
          ) : null}
        </div>

        <Button asChild size="small" variant="secondary">
          <a href={href}>Open account hub</a>
        </Button>
      </div>
    </Container>
  );
};

export const config = defineWidgetConfig({
  zone: "customer.details.side.after",
});

export default CustomerAccountLinkWidget;
