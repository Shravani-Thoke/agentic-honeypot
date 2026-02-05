import { groq } from "../config/groqClient.js";
import { getCachedScam, setCachedScam } from "../cache/scamCache.js";
import { getScamCacheKey } from "../utils/scamkey.js";
import { canUseGroq, recordGroqUse } from "../limits/groqLimiter.js";

function fallbackScamResult() {
  return {
    is_scam: false,
    confidence_score: 0.2,
    scam_category: "None",
    threat_level: "Low",
    indicators: [],
    reasoning: "Unable to confidently determine scam indicators."
  };
}

function parseJsonFromText(text) {
  const trimmed = text.trim();
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
    return JSON.parse(trimmed);
  }
  const first = trimmed.indexOf("{");
  const last = trimmed.lastIndexOf("}");
  if (first !== -1 && last !== -1 && last > first) {
    const candidate = trimmed.slice(first, last + 1);
    return JSON.parse(candidate);
  }
  throw new Error("No JSON object found in model response");
}

export async function detectScam(message) {
  const cacheKey = getScamCacheKey(message);
  const cached = getCachedScam(cacheKey);

  if (cached) {
    return cached;
  }

  if (!canUseGroq()) {
    return fallbackScamResult();
  }

  const system = `
### ROLE
You are a Cyber-Security Analyst assisting an automated honeypot system.

### OBJECTIVE
Analyze the message conservatively.
Only classify a message as a scam if there are STRONG and MULTIPLE indicators.
If the message could reasonably be legitimate, do NOT mark it as a scam.

### IMPORTANT INSTRUCTIONS
- Prefer false negatives over false positives.
- If uncertain, mark is_scam as false but lower confidence.
- Do NOT over-classify normal or business-like messages.

### OUTPUT FORMAT
{
  "is_scam": boolean,
  "confidence_score": float (0.0 to 1.0),
  "scam_category": "Phishing" | "Lottery" | "Job Fraud" | "Investment" | "None",
  "threat_level": "Low" | "Medium" | "High" | "Critical",
  "indicators": [string],
  "reasoning": string
}
`;

  const prompt = `
Return ONLY a valid JSON object. No markdown, no extra text.

### USER MESSAGE
"${message}"

`;

  try {
    recordGroqUse();

    const chat = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: system },
        { role: "user", content: prompt }
      ],
      temperature: 0,
      max_tokens: 200
    });

    const raw = chat.choices[0].message.content ?? "";
    const result = parseJsonFromText(raw);
    setCachedScam(cacheKey, result);
    return result;

  } catch (err) {
    console.error("Groq scam detection failed:", err.message);
    return fallbackScamResult();
  }
}
