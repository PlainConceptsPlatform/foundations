export function getInitials(text: string) {
  const words = text?.trim().split(" ");
  if (!words) return "";
  if (words.length < 2) return text.slice(0, 2);
  return words
    .map((w) => w.slice(0, 1))
    .slice(0, 2)
    .join("");
}
