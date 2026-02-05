const personaCache = new Map();

export function getCachedPersona(key) {
  return personaCache.get(key);
}

export function setCachedPersona(key, reply) {
  personaCache.set(key, reply);
}
