export function getInitials(text: string) {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length < 2) return trimmed.slice(0, 2);
  return words
    .map((w) => w.slice(0, 1))
    .slice(0, 2)
    .join("");
}
