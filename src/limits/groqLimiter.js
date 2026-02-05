let groqCalls = 0;
const MAX_GROQ_CALLS = 40; // safe for free tier

export function canUseGroq() {
  return groqCalls < MAX_GROQ_CALLS;
}

export function recordGroqUse() {
  groqCalls++;
}
