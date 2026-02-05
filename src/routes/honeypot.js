import express from "express";
import { authenticate } from "../middleware/auth.js";
import { detectScam } from "../services/scamDetector.js";
import { getConversation } from "../memory/conversationStore.js";
import { generatePersonaReply } from "../services/personaAgent.js";
import { extractIntelligence } from "../services/intelligenceExtractor.js";

const router = express.Router();

router.post("/", authenticate, async (req, res) => {
  //   const { message, conversation_id } = req.body;

  const conversation_id = req.body?.conversation_id || "default";
  const message = req.body?.message || "";

  if (!message.trim()) {
    return res.json({
      status: "success",
      is_scam: false,
      confidence_score: 0,
      scam_category: "None",
      threat_level: "Low",
      indicators: [],
      reasoning: "Empty or invalid message received.",
      persona_reply: null,
      intelligence: {
        phone_numbers: [],
        upi_ids: [],
        links: [],
        bank_accounts: [],
        ifsc_codes: [],
        crypto_addresses: [],
      },
      scam_context: false,
    });
  }

  //   const detection = await detectScam(message);
  const convo = getConversation(conversation_id);

  // Add current message
  convo.history.push(`Scammer: ${message}`);

  // Run detection ONLY on message
  const detection = await detectScam(message, convo.history);

  if (detection.is_scam) {
    convo.is_scam_context = true;
  }

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

    persona_reply,
    intelligence,

    scam_context: isScamConversation,
  };

  res.json(finalResponse);
});

export default router;
