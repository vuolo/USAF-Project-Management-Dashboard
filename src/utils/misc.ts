export function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function generateAlphaId(length: number): string {
  let alphaId = "";
  while (length >= 0) {
    const remainder = length % 26;
    alphaId = String.fromCharCode(65 + remainder) + alphaId;
    length = Math.floor(length / 26) - 1;
  }
  return alphaId;
}

export function generateNumberFromAlphaId(alphaId: string): number {
  let number = 0;
  for (let i = 0; i < alphaId.length; i++)
    number +=
      (alphaId.charCodeAt(i) - 65) * Math.pow(26, alphaId.length - i - 1);
  return number;
}

export function isNumeric(str: string): boolean {
  return /^\d+$/.test(str);
}
