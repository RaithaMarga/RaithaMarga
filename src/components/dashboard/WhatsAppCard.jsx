import { useLanguage } from '../../context/LanguageContext';
import { WHATSAPP_DISPLAY, buildWhatsAppLink } from '../../config/whatsapp';
import WhatsAppIcon from './WhatsAppIcon';
import './dashboard-ui.css';

// For farmers who would rather send their details than fill in forms.
const WhatsAppCard = () => {
  const { language } = useLanguage();
  return (
    <div className="whatsapp-card">
      <span className="whatsapp-card__icon"><WhatsAppIcon size={26} /></span>
      <div className="whatsapp-card__body">
        <h2 className="whatsapp-card__title">Prefer WhatsApp?</h2>
        <p className="whatsapp-card__text">
          Send your name, phone, produce, kg available and expected price (or a voice note) to {WHATSAPP_DISPLAY}.
          Our team will list it for you.
        </p>
      </div>
      <a className="btn btn--sm whatsapp-card__button" href={buildWhatsAppLink(language)} target="_blank" rel="noopener noreferrer">
        Send on WhatsApp
      </a>
    </div>
  );
};

export default WhatsAppCard;
