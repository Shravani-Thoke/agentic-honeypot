export function getPersonaCacheKey(message) {
  return message
    .toLowerCase()
    .replace(/\d+/g, "")        // remove numbers
    .replace(/[^\w\s]/g, "")   // remove symbols
    .trim()
    .slice(0, 60);              // normalize length
}
