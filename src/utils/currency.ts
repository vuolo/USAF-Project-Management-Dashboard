export function formatCurrency(amount: number, currency = "USD"): string {
  if (amount === null) return "...";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

