# 🕵️ Agentic Honeypot for Scam Detection & Intelligence Extraction

An AI-powered **conversation-aware honeypot** that detects scam messages, engages scammers using a believable persona, and extracts actionable intelligence such as phone numbers, UPI IDs, phishing links, bank account numbers, IFSC codes, and crypto wallet addresses.

## 🚀 Live Demo
https://agentic-honeypot-hd9h.onrender.com

---

## 🚀 Features

- 🛡️ AI-powered scam detection using **Groq (LLaMA 3.1)**
- 💬 Conversation-aware scam tracking
- 🎭 AI-generated victim persona for realistic engagement
- 🔍 Intelligence extraction from complete conversation history
- 🔐 API Key authentication
- ⚡ Caching and graceful fallback for reliable performance
- 🌐 REST API ready for deployment

---

## 🏗️ Architecture

```text
Incoming Request
        │
        ▼
Authentication Middleware
        │
        ▼
Conversation Memory
        │
        ▼
Scam Detection (Groq LLM)
        │
        ▼
Conversation marked as Scam
        │
        ▼
Persona Generation (Groq LLM)
        │
        ▼
Intelligence Extraction
        │
        ▼
Structured JSON Response
```

---

## 📂 Project Structure

```text
agentic-honeypot/
│
├── src/
│   ├── cache/
│   ├── config/
│   ├── memory/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── app.js
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Tech Stack

- **Backend:** Node.js, Express.js
- **LLM:** Groq API (LLaMA 3.1)
- **Authentication:** API Key
- **Storage:** In-memory Conversation Store
- **Deployment:** Render

---

## 🔄 Workflow

### 1. Receive Request

**POST** `/honeypot`

```json
{
  "conversation_id": "101",
  "message": "Your account has been blocked. Verify immediately."
}
```

---

### 2. Scam Detection

The incoming message is analyzed using **Groq LLaMA 3.1** to determine:

- Scam / Not Scam
- Confidence Score
- Scam Category
- Threat Level
- Scam Indicators

If a scam is detected:

```javascript
conversation.is_scam_context = true;
```

The conversation is now treated as malicious until it ends.

---

### 3. Persona Engagement

Once a conversation enters scam mode, the AI replies as a **confused, non-technical victim** to encourage the scammer to reveal more information.

**Example**

> "I'm not very familiar with this. Could you explain what I should do?"

---

### 4. Intelligence Extraction

The system continuously extracts intelligence from the **entire conversation history**.

Supported entities:

- 📱 Phone Numbers
- 💳 UPI IDs
- 🔗 URLs
- 🏦 Bank Account Numbers
- 🧾 IFSC Codes
- ₿ Crypto Wallet Addresses

---

### 5. API Response

```json
{
  "status": "success",
  "is_scam": true,
  "confidence_score": 0.91,
  "scam_category": "Phishing",
  "threat_level": "High",
  "persona_reply": "I'm not sure how to do that. Could you explain it step by step?",
  "intelligence": {
    "phone_numbers": ["9876543210"],
    "upi_ids": ["rahul@oksbi"],
    "links": ["https://secure-login.com"],
    "bank_accounts": [],
    "ifsc_codes": [],
    "crypto_addresses": []
  },
  "scam_context": true
}
```

---

## 🔐 Authentication

Include your API key in every request.

```http
x-api-key: YOUR_API_KEY
```

---

## 📡 API Endpoint

### POST `/honeypot`

### Request

```json
{
  "conversation_id": "101",
  "message": "..."
}
```

### Response

Returns:

- Scam classification
- Confidence score
- Threat level
- AI persona response
- Extracted intelligence
- Conversation scam context

---

## 🧪 Example Test

```http
POST /honeypot
```

```json
{
  "conversation_id": "101",
  "message": "Your account will be blocked today. Pay ₹500 to rahul@oksbi."
}
```

---

## 🚀 Future Improvements

- Redis-based conversation storage
- MongoDB persistence
- Multi-language support
- OCR for image-based scams
- Email & SMS integration
- Admin dashboard for scam intelligence

---

## 👩‍💻 Author

**Shravani Thoke**

Computer Engineering Student | AI & Machine Learning Enthusiast

- GitHub: https://github.com/Shravani-Thoke

---

## 📜 License

This project was developed as part of a cybersecurity hackathon for educational and research purposes.
