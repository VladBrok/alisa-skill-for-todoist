/**
 * @example
 * // returns "гостя"
 * pluralize(2, [
 *   "гость",
 *   "гостя",
 *   "гостей",
 * ]);
 */
export default function pluralize(
  count: number,
  words: [string, string, string]
) {
  const absCount = Math.abs(count);
  const lastTwoDigits = absCount % 100;
  const lastDigit = absCount % 10;

  return lastTwoDigits > 10 && lastTwoDigits < 20
    ? words[2]
    : lastDigit > 1 && lastDigit < 5
    ? words[1]
    : lastDigit == 1
    ? words[0]
    : words[2];
}
