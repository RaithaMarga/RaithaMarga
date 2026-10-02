import { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import './ContactSection.css';

const defaultForm = {
  fullName: '',
  contactValue: '',
  topic: 'General support',
  message: '',
};

const ContactSection = () => {
  const { t } = useLanguage();
  const [contactType, setContactType] = useState('email');
  const [form, setForm] = useState(defaultForm);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const fullName = form.fullName.trim();
    const contactValue = form.contactValue.trim();
    const message = form.message.trim();

    if (!fullName || !contactValue || !message) {
      window.alert('Please fill in your full name, email/phone, and message before sending.');
      return;
    }

    const topic = form.topic || 'General support';
    const supportEmail = 'raithamargaofficial@gmail.com';
    const whatsappNumber = '916360340277';

    const messageText = `Hello RaithaMarga support,%0A%0AFull Name: ${encodeURIComponent(fullName)}%0AContact: ${encodeURIComponent(contactValue)}%0ATopic: ${encodeURIComponent(topic)}%0A%0AMessage:%0A${encodeURIComponent(message)}`;

    if (contactType === 'phone') {
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${messageText}`;
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    const mailtoLink = `mailto:${supportEmail}?subject=${encodeURIComponent(`RaithaMarga Support: ${topic}`)}&body=${encodeURIComponent(
      `Full Name: ${fullName}\nContact: ${contactValue}\nTopic: ${topic}\n\nMessage:\n${message}`
    )}`;

    window.location.href = mailtoLink;
  };

  return (
    <section className="contact-section" id="contact">
      <div className="container contact-section__grid">
        <aside className="contact-section__info">
          <div>
            <span className="eyebrow contact-section__eyebrow">{t.nav.contact}</span>
            <h2 className="contact-section__title">{t.contact.title}</h2>
            <p className="contact-section__subtitle">{t.contact.subtitle}</p>
          </div>

          <div className="contact-section__support-box">
            <h3>{t.contact.support}</h3>

            <div className="contact-section__support-item">
              <div className="contact-section__icon" aria-hidden="true">✉</div>
              <div>
                <div className="contact-section__label">{t.contact.emailLabel}</div>
                <p className="contact-section__value">
                  <a href="mailto:raithamargaofficial@gmail.com">raithamargaofficial@gmail.com</a>
                </p>
              </div>
            </div>

            <div className="contact-section__support-item">
              <div className="contact-section__icon" aria-hidden="true">💬</div>
              <div>
                <div className="contact-section__label">{t.contact.whatsappLabel}</div>
                <p className="contact-section__value">
                  {t.contact.whatsappText} <strong>6360340277</strong>
                </p>
              </div>
            </div>
          </div>
        </aside>

        <div className="contact-section__form-panel">
          <h3 className="contact-section__form-title">{t.contact.formTitle}</h3>
          <p className="contact-section__form-intro">{t.contact.formIntro}</p>

          <form className="contact-section__form" onSubmit={handleSubmit}>
            <div className="contact-section__field">
              <label htmlFor="contact-full-name">{t.contact.fullName}</label>
              <input
                id="contact-full-name"
                name="fullName"
                type="text"
                value={form.fullName}
                onChange={handleChange}
                placeholder={t.contact.fullNamePlaceholder}
              />
            </div>

            <div className="contact-section__field">
              <label>{t.contact.preferredMethod}</label>
              <div className="contact-section__choice-group">
                <label className="contact-section__choice-pill">
                  <input
                    type="radio"
                    name="contactPreference"
                    checked={contactType === 'email'}
                    onChange={() => setContactType('email')}
                  />
                  <span>{t.contact.emailChoice}</span>
                </label>
                <label className="contact-section__choice-pill">
                  <input
                    type="radio"
                    name="contactPreference"
                    checked={contactType === 'phone'}
                    onChange={() => setContactType('phone')}
                  />
                  <span>{t.contact.phoneChoice}</span>
                </label>
              </div>
            </div>

            <div className="contact-section__field">
              <label htmlFor="contact-method-value">{t.contact.contactValueLabel}</label>
              <input
                id="contact-method-value"
                name="contactValue"
                type={contactType === 'email' ? 'email' : 'tel'}
                value={form.contactValue}
                onChange={handleChange}
                placeholder={t.contact.contactValuePlaceholder}
              />
            </div>

            <div className="contact-section__field">
              <label htmlFor="contact-topic">{t.contact.helpLabel}</label>
              <select id="contact-topic" name="topic" value={form.topic} onChange={handleChange}>
                {t.contact.helpOptions.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div className="contact-section__field">
              <label htmlFor="contact-message">{t.contact.messageLabel}</label>
              <textarea
                id="contact-message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder={t.contact.messagePlaceholder}
              />
            </div>

            <button type="submit" className="contact-section__submit-btn">
              {t.contact.sendButton}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
