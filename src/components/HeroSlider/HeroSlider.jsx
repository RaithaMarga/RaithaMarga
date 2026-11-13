import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import WhatsAppIcon from '../dashboard/WhatsAppIcon';
import heroImg from '../../assets/hero.png';
import fieldImg from '../../assets/login-bg-field.jpg';
import tomatoImg from '../../assets/images/vegetables/tomato.jpg';
import './HeroSlider.css';

const HeroSlider = () => {
  const { language } = useLanguage();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const slides = [
    {
      id: 1,
      image: heroImg,
      badgeKn: '🌿 ಕರ್ನಾಟಕದ ನೇರ ಕೃಷಿ ಮಾರುಕಟ್ಟೆ ವೇದಿಕೆ',
      badgeEn: '🌿 Direct Farm-To-Buyer Agricultural Platform',
      titleKn: 'ಮಣ್ಣಿನಿಂದ ಮಂಡಿಗೆ ನೇರ ಸಂಪರ್ಕ, ಮಧ್ಯವರ್ತಿಗಳಿಲ್ಲ',
      titleEn: 'Direct Farm-to-Buyer Marketplace, 0% Middlemen',
      highlightKn: 'ನ್ಯಾಯಯುತ ಬೆಲೆ, ಪರಿಶೀಲಿತ ಖರೀದಿದಾರರು',
      highlightEn: 'Fair Prices & Verified Buyers',
      descKn: 'ರೈತರಿಗೆ ಬೆವರ ಹನಿಗೆ ತಕ್ಕ ಗೌರವಯುತ ಲಾಭ, ಖರೀದಿದಾರರಿಗೆ ಗದ್ದೆಯಿಂದ ತಾಜಾ ಉತ್ಪನ್ನಗಳು.',
      descEn: 'Empowering Karnataka farmers with direct market access, fair profits, and genuine wholesale buyers.',
      ctaPrimaryKn: '🌾 ರೈತ ಸೈನ್ ಇನ್ / ನೋಂದಣಿ',
      ctaPrimaryEn: '🌾 Sell as Farmer',
      ctaPrimaryLink: '/login?role=farmer',
      ctaSecondaryKn: '🏢 ಖರೀದಿದಾರ ಸೈನ್ ಇನ್',
      ctaSecondaryEn: '🏢 Buy Fresh Produce',
      ctaSecondaryLink: '/login?role=buyer',
      tag: '0% Brokerage',
      stats: [
        { num: '0%', labelKn: 'ಕಮಿಷನ್ ಕಡಿತ', labelEn: 'Zero Commission' },
        { num: 'Verified', labelKn: 'ಪರಿಶೀಲಿತ ಖರೀದಿದಾರರು', labelEn: 'Verified Buyers' },
        { num: 'Direct', labelKn: 'ಗದ್ದೆಯಿಂದ ಮಂಡಿಗೆ', labelEn: 'Farm to Buyer' },
      ],
    },
    {
      id: 2,
      image: tomatoImg,
      badgeKn: '🍅 ಕರ್ನಾಟಕದ ತಾಜಾ ಸ್ಥಳೀಯ ಬೆಳೆಗಳು',
      badgeEn: '🍅 Fresh Local Harvest from Karnataka',
      titleKn: 'ತಾಜಾ ತರಕಾರಿಗಳು ಮತ್ತು ಹಣ್ಣುಗಳ ನೇರ ಪಟ್ಟಿ',
      titleEn: 'Fresh Produce Directly Listed by Local Farmers',
      highlightKn: 'ಟೊಮೆಟೊ, ಈರುಳ್ಳಿ, ಆಲೂಗಡ್ಡೆ ಮತ್ತು ಹಸಿ ತರಕಾರಿಗಳು',
      highlightEn: 'Tomato, Onion, Potato & Seasonal Veggies',
      descKn: 'ದಿನನಿತ್ಯದ ಸಗಟು ಖರೀದಿದಾರರಿಗೆ ಗುಣಮಟ್ಟ ಪರಿಶೀಲಿಸಿದ ತಾಜಾ ಉತ್ಪನ್ನಗಳು ಕ್ಷಣಾರ್ಧದಲ್ಲಿ ಲಭ್ಯ.',
      descEn: 'Connect directly with harvest-ready farmers with complete quality transparency and fair trade.',
      ctaPrimaryKn: '🔍 ಬೆಳೆಗಳನ್ನು ವೀಕ್ಷಿಸಿ',
      ctaPrimaryEn: '🔍 Browse Crops',
      ctaPrimaryLink: '/crops',
      ctaSecondaryKn: '🌾 ಬೆಳೆ ಮಾರಾಟ ಮಾಡಿ',
      ctaSecondaryEn: '🌾 List Your Produce',
      ctaSecondaryLink: '/login?role=farmer',
      tag: 'Direct Harvest',
      stats: [
        { num: '24+', labelKn: 'ಬೆಳೆಗಳ ವಿಧಗಳು', labelEn: 'Crop Varieties' },
        { num: 'Kolar', labelKn: 'ಪೈಲಟ್ ಜಿಲ್ಲೆ', labelEn: 'Pilot District' },
        { num: 'Daily', labelKn: 'ತಾಜಾ ಕೊಯ್ಲು', labelEn: 'Fresh Harvest' },
      ],
    },
    {
      id: 4,
      image: fieldImg,
      badgeKn: '💬 ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಸುಲಭ ಮಾರಾಟ',
      badgeEn: '💬 Fast WhatsApp Selling Desk for Farmers',
      titleKn: 'ಟೈಪ್ ಮಾಡುವ ಅಗತ್ಯವಿಲ್ಲ, ಕೇವಲ 30 ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಮಾರಾಟ',
      titleEn: 'Sell In 30 Seconds: Just Send a Photo on WhatsApp',
      highlightKn: 'ಕೇವಲ ಫೋಟೋ ಅಥವಾ ಧ್ವನಿ ಸಂದೇಶ ಕಳುಹಿಸಿ',
      highlightEn: 'No Typing Needed • Send Kannada Voice Note',
      descKn: 'ನಮ್ಮ ಜಿಲ್ಲಾ ಆಡಳಿತ ತಂಡವೇ ನಿಮ್ಮ ಬೆಳೆಯನ್ನು ಲೈವ್ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಪಟ್ಟಿ ಮಾಡಿ ಖರೀದಿದಾರರನ್ನು ಜೋಡಿಸುತ್ತದೆ.',
      descEn: 'Our assisted team immediately creates your marketplace listing and connects verified bulk buyers.',
      ctaPrimaryKn: '💬 ವಾಟ್ಸಾಪ್ ಮೂಲಕ ಮಾರಾಟ',
      ctaPrimaryEn: '💬 Sell on WhatsApp',
      ctaPrimaryLink: '#sell-on-whatsapp',
      ctaSecondaryKn: '🏢 ಖರೀದಿದಾರರಿಗೆ ಸಂಪರ್ಕ',
      ctaSecondaryEn: '🏢 Buyer Registration',
      ctaSecondaryLink: '/register',
      tag: 'WhatsApp Assisted',
      stats: [
        { num: '30 Sec', labelKn: 'ತ್ವರಿತ ಪಟ್ಟಿ', labelEn: 'Instant Listing' },
        { num: 'ಕನ್ನಡ', labelKn: 'ಧ್ವನಿ ಸಂದೇಶ ಸಹಾಯ', labelEn: 'Voice Note Support' },
        { num: 'Free', labelKn: 'ಉಚಿತ ನೋಂದಣಿ', labelEn: 'Free for Farmers' },
      ],
    },
  ];

  const totalSlides = slides.length;

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused, totalSlides]);

  const goToSlide = (idx) => {
    setCurrentSlide(idx);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  const s = slides[currentSlide];

  return (
    <section
      className="hero-slider"
      id="home"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-label="Featured agricultural updates and market access"
    >
      {/* Background slide images with crossfade */}
      <div className="hero-slider__bg-container">
        {slides.map((slide, idx) => (
          <div
            key={slide.id}
            className={`hero-slider__bg-slide ${slide.id === 1 ? 'hero-slider__bg-slide--farmer' : ''} ${idx === currentSlide ? 'hero-slider__bg-slide--active' : ''}`}
            style={{ backgroundImage: `url(${slide.image})` }}
          >
            <div className="hero-slider__overlay" />
          </div>
        ))}
      </div>

      {/* Decorative leaf watermarks and floating particles */}
      <div className="hero-slider__floating-leaf hero-slider__floating-leaf--1">🌾</div>
      <div className="hero-slider__floating-leaf hero-slider__floating-leaf--2">🍃</div>
      <div className="hero-slider__floating-leaf hero-slider__floating-leaf--3">✨</div>

      {/* Content wrapper */}
      <div className="container hero-slider__content-wrap">
        <div className="hero-slider__content">
          {/* Eyebrow badge */}
          <div className="hero-slider__badge-wrap">
            <span className="hero-slider__badge">
              <span className="hero-slider__badge-dot" />
              {language === 'kn' ? s.badgeKn : s.badgeEn}
            </span>
            <span className="hero-slider__tag">{s.tag}</span>
          </div>

          {/* Animated Main Title */}
          <h1 className="hero-slider__title">
            <span>{language === 'kn' ? s.titleKn : s.titleEn}</span>
            <br />
            <span className="hero-slider__title-accent">
              {language === 'kn' ? s.highlightKn : s.highlightEn}
            </span>
          </h1>

          {/* Subtitle */}
          <p className="hero-slider__desc">
            {language === 'kn' ? s.descKn : s.descEn}
          </p>

          {/* Action buttons */}
          <div className="hero-slider__actions">
            <Link to={s.ctaPrimaryLink} className="hero-btn hero-btn--primary">
              <span className="hero-btn__shine" />
              <span className="hero-btn__text">
                {language === 'kn' ? s.ctaPrimaryKn : s.ctaPrimaryEn}
              </span>
              <span className="hero-btn__arrow">→</span>
            </Link>

            <Link to={s.ctaSecondaryLink} className="hero-btn hero-btn--glass">
              <span className="hero-btn__text">
                {language === 'kn' ? s.ctaSecondaryKn : s.ctaSecondaryEn}
              </span>
              <span className="hero-btn__arrow">→</span>
            </Link>

            <a href="#sell-on-whatsapp" className="hero-slider__wa-pill" title="WhatsApp Assisted Sourcing">
              <WhatsAppIcon size={18} />
              <span>{language === 'kn' ? 'ವಾಟ್ಸಾಪ್ ಸಹಾಯ' : 'WhatsApp Desk'}</span>
            </a>
          </div>

          {/* Live micro stats inside current slide */}
          <div className="hero-slider__stats">
            {s.stats.map((stat, i) => (
              <div key={i} className="hero-slider__stat-item">
                <span className="hero-slider__stat-num">{stat.num}</span>
                <span className="hero-slider__stat-label">
                  {language === 'kn' ? stat.labelKn : stat.labelEn}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        type="button"
        className="hero-slider__nav-btn hero-slider__nav-btn--prev"
        onClick={prevSlide}
        aria-label="Previous Slide"
      >
        ‹
      </button>

      <button
        type="button"
        className="hero-slider__nav-btn hero-slider__nav-btn--next"
        onClick={nextSlide}
        aria-label="Next Slide"
      >
        ›
      </button>

      {/* Pagination Indicators / Dots */}
      <div className="hero-slider__indicators" role="tablist">
        {slides.map((slide, idx) => (
          <button
            key={slide.id}
            type="button"
            role="tab"
            aria-selected={idx === currentSlide}
            className={`hero-slider__dot ${idx === currentSlide ? 'hero-slider__dot--active' : ''}`}
            onClick={() => goToSlide(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          >
            <span className="hero-slider__dot-fill" />
          </button>
        ))}
      </div>
    </section>
  );
};

export default HeroSlider;
