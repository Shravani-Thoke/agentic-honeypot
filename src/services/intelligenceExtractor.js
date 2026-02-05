export function extractIntelligence(history) {
  let text = history.join(" ");

  // Extract phone numbers first and remove them from text
  const phoneRegex = /\b(\+91[\s-]?)?[6-9]\d{9}\b/g;
  const phone_numbers = [...new Set((text.match(phoneRegex) || []).map(num => num.replace(/[\s-]/g, '')))];
  
  // Remove phone numbers to avoid confusion with bank accounts
  phone_numbers.forEach(num => {
    text = text.replace(new RegExp(num.replace(/[+]/g, '\\+'), 'g'), '');
  });

  // === ROBUST UPI EXTRACTION ===
  const upiText = text.replace(/\s*@\s*/g, "@"); // Normalize spaces
  
  // Multi-pattern UPI detection
  const upiPatterns = [
    // Standard UPI format: username@provider
    /\b[a-z0-9][a-z0-9.\-_]{1,63}@[a-z]{2,}[a-z0-9\-]{0,61}\b/gi,
    
    // Captures UPI with numbers at start (some providers allow)
    /\b[0-9]{4,10}@[a-z]{2,}[a-z0-9\-]{0,61}\b/gi,
    
    // Phone number based UPI (mobile@provider)
    /\b[6-9]\d{9}@[a-z]{2,}[a-z0-9\-]{0,61}\b/gi,
  ];
  
  let upi_candidates = [];
  upiPatterns.forEach(pattern => {
    const matches = upiText.match(pattern) || [];
    upi_candidates.push(...matches);
  });
  
  // Clean and filter UPI IDs
  const upi_ids = upi_candidates
    .map(id => id.toLowerCase().trim())
    .map(id => id.replace(/^[("'[{]+|[),.:"'!?\]}]+$/g, '')) // Remove wrapping chars
    .filter(id => {
      if (!id.includes('@')) return false;
      
      const [username, handle] = id.split('@');
      
      // Validation checks
      if (username.length < 2 || handle.length < 2) return false;
      
      const emailDomains = [
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
        'protonmail.com', 'icloud.com', 'aol.com', 'mail.com',
        'zoho.com', 'yandex.com', 'gmx.com', 'tutanota.com',
      ];
      
      if (emailDomains.some(domain => handle.endsWith(domain))) return false;
      
      const knownUpiHandles = [
        'paytm', 'phonepe', 'tjsb','ybl', 'okaxis', 'oksbi', 'okicici', 
        'okhdfcbank', 'okbizaxis', 'ibl', 'axl', 'apl', 'sbi', 
        'pnb', 'boi', 'cnrb', 'upi', 'pthdfc', 'ptyes', 'airtel',
        'fbl', 'gpay', 'ikwik', 'imobile', 'jupiteraxis', 'kotak',
        'lig', 'mahb', 'mairtel', 'finobank', 'pingpay', 'timecosmos',
        'yapl', 'wafibank', 'dlb', 'unionbank', 'federal', 'indus',
        'rbl', 'scbl', 'hsbc', 'dbs', 'icici', 'bandhan', 'axis',
        'barb', 'barodampay', 'citi', 'equitas', 'aubank', 'idfc'
      ];
      
      // If it matches known UPI handle, definitely include
      if (knownUpiHandles.includes(handle)) return true;
      
      // Otherwise, use heuristics:
      // - Handle doesn't look like email (no .com, .org, etc. at end)
      // - Handle is relatively short (UPI handles are typically < 20 chars)
      const looksLikeEmail = /\.(com|org|net|edu|gov|in|co|io|me|info|biz|xyz)$/i.test(handle);
      return !looksLikeEmail && handle.length <= 30;
    })
    .filter((id, index, self) => self.indexOf(id) === index); // Deduplicate

  // === EXTRACT URLs ===
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/gi;
  const links = [...new Set(text.match(urlRegex) || [])];

  // === EXTRACT BANK ACCOUNTS ===
  // Remove already found phone numbers and UPI IDs to avoid false positives
  let bankText = text;
  upi_ids.forEach(upi => {
    bankText = bankText.replace(new RegExp(upi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), '');
  });
  
  const bankRegex = /\b\d{11,18}\b/g;
  const bank_accounts = [...new Set(bankText.match(bankRegex) || [])];

  // === EXTRACT IFSC CODES (bonus for scam detection) ===
  const ifscRegex = /\b[A-Z]{4}0[A-Z0-9]{6}\b/g;
  const ifsc_codes = [...new Set(text.match(ifscRegex) || [])];

  // === EXTRACT WALLET IDs/ADDRESSES (crypto scams) ===
  const cryptoRegex = /\b(bc1|0x)[a-zA-Z0-9]{25,62}\b/g;
  const crypto_addresses = [...new Set(text.match(cryptoRegex) || [])];

  return {
    phone_numbers,
    upi_ids,
    links,
    bank_accounts,
    ifsc_codes,      
    crypto_addresses  
  };
}
