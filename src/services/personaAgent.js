import { groq } from "../config/groqClient.js";
import { getCachedPersona, setCachedPersona } from "../cache/personaCache.js";
import { getPersonaCacheKey } from "../utils/cacheKey.js";
import { canUseGroq, recordGroqUse } from "../limits/groqLimiter.js";

function fallbackPersonaReply() {
  return "I’m not very familiar with this. Can you please explain how it works?";
}

export async function generatePersonaReply(history, lastMessage) {
  if (history.length > 6) {
    return fallbackPersonaReply();
  }

  const cacheKey = getPersonaCacheKey(lastMessage);
  const cached = getCachedPersona(cacheKey);

  if (cached) {
    return cached;
  }

  if (!canUseGroq()) {
    return fallbackPersonaReply();
  }

  const prompt = `
You are an everyday Indian user receiving this message. You are cautious but cooperative.

CHARACTER TRAITS:
- You sound natural and human, not robotic
- You're slightly unsure but willing to help resolve issues
- You ask practical questions about next steps
- You never mention scams, fraud, or being suspicious
- You seem busy but responsive

RESPONSE STYLE:
- ALWAYS reply in English only (even if they use Hindi)
- Keep responses SHORT: 1 sentence, maximum 15 words
- Sound casual: "Ok", "Sure", "Got it", "One moment"
- Show mild concern: "Is everything alright?", "Did something happen?"
- Be cooperative: "What should I do?", "Should I check something?"

DO NOT:
- Use Hindi, regional languages, or transliteration
- Write long explanations
- Ask multiple questions at once
- Sound too formal or robotic
- Mention scams, fraud, security, or warnings
- Use phrases like "I understand", "Thank you for clarifying"

EXTRACT INFORMATION BY:
- Asking WHERE to send/check ("Which app?", "Where exactly?")
- Confirming amounts ("How much was it?")
- Requesting clarification ("What's the reference number?")
- Acting slightly confused ("What link?", "Which account?")

Conversation so far:
${history.slice(-4).join("\n")}

Latest message: "${lastMessage}"

Your reply (1 short sentence):`;

  try {
    recordGroqUse();

    const chat = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 80
    });

    const reply = chat.choices[0].message.content.trim();
    setCachedPersona(cacheKey, reply);

    return reply;
  } catch (err) {
    console.error("Groq error:", err.message);
    return fallbackPersonaReply();
  }
}
