export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}