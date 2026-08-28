import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import logoMark from '../../assets/logo-mark.png';
import './Footer.css';

const Footer = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">
            <img src={logoMark} alt="RaithaMarga" width="36" height="36" />
            RaithaMarga
          </span>
          <p className="footer__tagline">{t.footer.tagline}</p>
        </div>

        <div className="footer__columns">
          <div className="footer__col">
            <h4 className="footer__heading">{t.footer.platform}</h4>
            <a href="#how-it-works">{t.nav.how}</a>
            <a href="#features">{t.nav.features}</a>
            <a href="#trust">{t.nav.trust}</a>
            <a href="#impact">{t.nav.impact}</a>
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">{t.footer.forYou}</h4>
            <Link to="/farmer/dashboard">{t.hero.ctaFarmer}</Link>
            <a href="#get-started">{t.hero.ctaBuyer}</a>
            <a href="#login">{t.nav.login}</a>
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">{t.footer.pilot}</h4>
            <span className="footer__static">{t.footer.pilot1}</span>
            <span className="footer__static">{t.footer.pilot2}</span>
          </div>
        </div>
      </div>

      <div className="footer__bottom">
        <div className="container footer__bottom-inner">
          <span>&copy; {year} {t.footer.copyright}</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
