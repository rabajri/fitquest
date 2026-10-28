const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const PERSIAN_DIGITS = '۰۱۲۳۴۵۶۷۸۹';

/**
 * Reads a number typed on any phone keyboard.
 * Accepts "70.5", "70,5" (European / Arabic keyboards), "٧٠٫٥" (Arabic digits) and surrounding spaces.
 * Returns NaN for empty or invalid text, so check with Number.isFinite.
 */
export function parseDecimal(text: string): number {
  const normalized = text
    .trim()
    .replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String(PERSIAN_DIGITS.indexOf(d)))
    .replace(/[,٫]/g, '.');

  if (!/^\d+(\.\d+)?$|^\.\d+$|^\d+\.$/.test(normalized)) return NaN;
  return Number(normalized);
}
