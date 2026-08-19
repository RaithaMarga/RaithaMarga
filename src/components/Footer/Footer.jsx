import { useLanguage } from '../../context/LanguageContext';
import './Footer.css';

const Footer = () => {
  const { t } = useLanguage();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__logo">RaithaMarga</span>
          <p className="footer__tagline">{t.footer.tagline}</p>
        </div>

        <div className="footer__columns">
          <div className="footer__col">
            <h4 className="footer__heading">{t.footer.platform}</h4>
            <a href="#how-it-works">{t.nav.how}</a>
            <a href="#features">{t.nav.features}</a>
            <a href="#impact">{t.nav.impact}</a>
          </div>
          <div className="footer__col">
            <h4 className="footer__heading">{t.footer.forYou}</h4>
            <a href="#get-started">{t.hero.ctaFarmer}</a>
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
