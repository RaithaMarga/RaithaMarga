import { cartTotals } from '../lib/cart';
import { useLanguage } from '../context/LanguageContext';
import { rupees } from '../lib/money';
export default function CartSummary({ items }) {
  const { subtotal, fee, total, farmerReceives } = cartTotals(items);
  const { language } = useLanguage();
  const kn = language === 'kn';
  return <div className="shopping-summary">
    <p><span>{kn ? 'ಉಪಮೊತ್ತ / Subtotal' : 'Subtotal'}</span><strong>{rupees(subtotal)}</strong></p>
    <p><span>{kn ? 'ಖರೀದಿದಾರರ ವೇದಿಕೆ ಶುಲ್ಕ 1%' : 'Buyer Platform Fee 1%'}</span><strong>+ {rupees(fee)}</strong></p>
    <p className="shopping-summary__total"><span>{kn ? 'ಒಟ್ಟು ಪಾವತಿ / Total Payable' : 'Total Payable'}</span><strong>{rupees(total)}</strong></p>
    <small>{kn ? `1% ವೇದಿಕೆ ಶುಲ್ಕದ ನಂತರ ರೈತರಿಗೆ ${rupees(farmerReceives)} ಸಿಗುತ್ತದೆ` : `Farmer receives ${rupees(farmerReceives)} after 1% platform fee`}</small>
    <small>1% + 1% Platform Fee / ವೇದಿಕೆ ಶುಲ್ಕ</small>
  </div>;
}
