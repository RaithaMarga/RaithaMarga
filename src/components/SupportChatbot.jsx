import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useMarketplaceListings } from '../hooks/useMarketplaceListings';
import { CROP_KANNADA_MAP } from '../data/crops';
import { getSupportAnswer } from '../lib/supportAssistant';
import './SupportChatbot.css';

const SupportChatbot = () => {
  const { language } = useLanguage();
  const isKannada = language === 'kn';
  const listings = useMarketplaceListings();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [messageCount, setMessageCount] = useState(0);
  const endOfMessagesRef = useRef(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const sendMessage = (text = input) => {
    const question = text.trim();
    if (!question) return;
    const answer = getSupportAnswer(question, listings, {
      cropTranslations: CROP_KANNADA_MAP,
      isKannada,
    });
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, sender: 'user', text: question },
      { id: `${Date.now()}-support`, sender: 'support', text: answer },
    ]);
    setMessageCount((count) => count + 1);
    setInput('');
  };

  return (
    <div className="support-chat">
      {isOpen && (
        <section className="support-chat__panel" aria-label={isKannada ? 'ಮಾರುಕಟ್ಟೆ ಸಹಾಯಕ ಚಾಟ್' : 'Market Assistant chat'}>
          <header className="support-chat__header">
            <div className="support-chat__brand">
              <span className="support-chat__avatar" aria-hidden="true">R</span>
              <div>
                <strong>{isKannada ? 'ಮಾರುಕಟ್ಟೆ ಸಹಾಯಕ' : 'Market Assistant'}</strong>
                <span>{isKannada ? 'ನಿಮಗೆ ಸಹಾಯ ಮಾಡಲು ಇಲ್ಲಿದ್ದೇವೆ' : 'Here to help you'}</span>
              </div>
            </div>
            <button
              type="button"
              className="support-chat__close"
              onClick={() => setIsOpen(false)}
              aria-label={isKannada ? 'ಚಾಟ್ ಮುಚ್ಚಿ' : 'Close chat'}
            >
              ×
            </button>
          </header>

          <div className="support-chat__messages" aria-live="polite">
            <div className="support-chat__message support-chat__message--support">
              {isKannada
                ? 'ನಮಸ್ಕಾರ! ನಾನು ಮಾರುಕಟ್ಟೆ ಸಹಾಯಕ. ಉತ್ಪನ್ನಗಳ ಲಭ್ಯತೆ, ಬೆಲೆ ಅಥವಾ ಖರೀದಿ ಮತ್ತು ಮಾರಾಟದ ಬಗ್ಗೆ ಕೇಳಿ.'
                  : 'Hello! I’m your Market Assistant. Ask about listings, your account, offers, deals, or general crop guidance.'}
            </div>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`support-chat__message support-chat__message--${message.sender}`}
              >
                {message.text}
              </div>
            ))}
            <div ref={endOfMessagesRef} />
          </div>

          {messageCount === 0 && (
            <div className="support-chat__suggestions">
              <button type="button" onClick={() => sendMessage(isKannada ? 'ಈರುಳ್ಳಿ ಎಷ್ಟು ಲಭ್ಯವಿದೆ?' : 'How much onion is available?')}>
                {isKannada ? 'ಲಭ್ಯವಿರುವ ಉತ್ಪನ್ನಗಳು' : 'Check availability'}
              </button>
              <button type="button" onClick={() => sendMessage(isKannada ? 'ಖರೀದಿಸುವುದು ಹೇಗೆ?' : 'How do I buy produce?')}>
                {isKannada ? 'ಖರೀದಿಸುವುದು ಹೇಗೆ?' : 'How to buy'}
              </button>
            </div>
          )}

          <form
            className="support-chat__form"
            onSubmit={(event) => {
              event.preventDefault();
              sendMessage();
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={isKannada ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಬರೆಯಿರಿ...' : 'Type your question...'}
              aria-label={isKannada ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆ' : 'Your question'}
            />
            <button type="submit" disabled={!input.trim()} aria-label={isKannada ? 'ಕಳುಹಿಸಿ' : 'Send message'}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M3 11.5 21 3l-5.5 18-3.2-7.3L3 11.5Zm9.3 2.2L21 3" />
              </svg>
            </button>
          </form>
          <div className="support-chat__caption">
            {isKannada ? 'ಸ್ವಯಂಚಾಲಿತ ಸಹಾಯಕ · ಖಚಿತ ಬೆಲೆಗೆ ಪಟ್ಟಿ ಪರಿಶೀಲಿಸಿ' : 'Automated support · check listings for confirmed prices'}
          </div>
        </section>
      )}

      <button
        type="button"
        className={`support-chat__launcher ${isOpen ? 'support-chat__launcher--open' : ''}`}
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        aria-label={isOpen ? (isKannada ? 'ಚಾಟ್ ಮುಚ್ಚಿ' : 'Close support chat') : (isKannada ? 'ಸಹಾಯ ಚಾಟ್ ತೆರೆಯಿರಿ' : 'Open support chat')}
      >
        {isOpen ? (
          <span aria-hidden="true">×</span>
        ) : (
          <>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-5.5a7.5 7.5 0 1 1 17-4Z" />
              <path d="M8 11h8M8 14.5h5" />
            </svg>
            <span>{isKannada ? 'ಸಹಾಯ' : 'Help'}</span>
          </>
        )}
      </button>
    </div>
  );
};

export default SupportChatbot;
