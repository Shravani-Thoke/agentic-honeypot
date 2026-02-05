import express from "express";
import { authenticate } from "../middleware/auth.js";
import { detectScam } from "../services/scamDetector.js";
import { getConversation } from "../memory/conversationStore.js";
import { generatePersonaReply } from "../services/personaAgent.js";
import { extractIntelligence } from "../services/intelligenceExtractor.js";

const router = express.Router();

router.post("/", authenticate, async (req, res) => {
  const { message, conversation_id } = req.body;

  if (!message || !conversation_id) {
    return res.status(400).json({
      status: "error",
      message: "message and conversation_id are required"
    });
  }

//   const detection = await detectScam(message);
  const convo = getConversation(conversation_id);

// Add current message
convo.history.push(`Scammer: ${message}`);

// Run detection ONLY on message
const detection = await detectScam(message, convo.history);

// 🔒 Persist scam context
if (detection.is_scam) {
  convo.is_scam_context = true;
}

// 🧠 Conversation-aware decision
const isScamConversation = convo.is_scam_context;

// Persona logic
let persona_reply = null;
if (isScamConversation) {
  persona_reply = await generatePersonaReply(convo.history, message);
  convo.history.push(`Victim: ${persona_reply}`);
}

// Intelligence ALWAYS extracted
const intelligence = extractIntelligence(convo.history);

// Override output meaningfully
const finalResponse = {
  status: "success",

  // Message-level classification
  is_scam: detection.is_scam,
  confidence_score: detection.confidence_score,
  scam_category: detection.scam_category,
  threat_level: detection.threat_level,
  indicators: detection.indicators,
  reasoning: detection.reasoning,

  // Conversation-level behavior
  persona_reply,
  intelligence,

  // 🔥 Optional but powerful (for judges)
  scam_context: isScamConversation
};

res.json(finalResponse);

});

export default router;
