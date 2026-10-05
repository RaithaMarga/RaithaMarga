// RaithaMarga's WhatsApp Business number, used for "Sell on WhatsApp".
// Digits only, with country code (91 = India), as wa.me requires.
export const WHATSAPP_NUMBER = '916360340277';
export const WHATSAPP_DISPLAY = '63603 40277';

// Pre-filled message the farmer completes and sends. Labels are kept in the same
// order as the admin "add farmer" form so the team can copy values straight across.
const MESSAGES = {
  en: [
    'Hello RaithaMarga, I want to sell my produce.',
    '',
    'Name:',
    'Phone number:',
    'Village / Taluk / District:',
    'Produce (crop):',
    'Quantity available (kg):',
    'Expected price (₹ per kg):',
    'Available from (date):',
  ],
  kn: [
    'ನಮಸ್ಕಾರ ರೈತಮಾರ್ಗ, ನಾನು ನನ್ನ ಉತ್ಪನ್ನ ಮಾರಾಟ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ.',
    '',
    'ಹೆಸರು:',
    'ಫೋನ್ ಸಂಖ್ಯೆ:',
    'ಗ್ರಾಮ / ತಾಲ್ಲೂಕು / ಜಿಲ್ಲೆ:',
    'ಬೆಳೆ / ಉತ್ಪನ್ನ:',
    'ಲಭ್ಯವಿರುವ ಪ್ರಮಾಣ (ಕೆ.ಜಿ):',
    'ನಿರೀಕ್ಷಿತ ಬೆಲೆ (₹ ಪ್ರತಿ ಕೆ.ಜಿ):',
    'ಯಾವಾಗಿನಿಂದ ಲಭ್ಯ (ದಿನಾಂಕ):',
  ],
};

export const buildWhatsAppLink = (language = 'en') => {
  const lines = MESSAGES[language] || MESSAGES.en;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join('\n'))}`;
};
