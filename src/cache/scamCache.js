const scamCache = new Map();

export function getCachedScam(key) {
  return scamCache.get(key);
}

export function setCachedScam(key, value) {
  scamCache.set(key, value);
}
