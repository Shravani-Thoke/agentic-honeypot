export function getScamCacheKey(message) {
  return message
    .toLowerCase()
    .replace(/\d+/g, "")       // remove numbers
    .replace(/[^\w\s]/g, "")  // remove punctuation
    .trim()
    .slice(0, 80);
}
