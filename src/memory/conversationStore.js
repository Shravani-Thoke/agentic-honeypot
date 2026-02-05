const conversations = {};

export function getConversation(conversationId) {
  if (!conversations[conversationId]) {
    conversations[conversationId] = {
      history: [],
      is_scam_context: false
    };
  }
  return conversations[conversationId];
}
