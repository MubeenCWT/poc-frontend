import { FaWhatsapp } from 'react-icons/fa';

const RAW_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '';
const DIGITS = RAW_NUMBER.replace(/[^0-9]/g, '');
const PREFILL = 'Hi DAR! I would like to ask about a property.';

export const WHATSAPP_ENABLED = DIGITS.length > 0;

export function whatsappLink(text = PREFILL) {
  return `https://wa.me/${DIGITS}?text=${encodeURIComponent(text)}`;
}

export default function WhatsAppButton() {
  if (!WHATSAPP_ENABLED) return null;

  return (
    <a
      href={whatsappLink()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="wa-fab"
    >
      <FaWhatsapp className="wa-fab__icon" />
      <span className="wa-fab__label">Chat on WhatsApp</span>
    </a>
  );
}
