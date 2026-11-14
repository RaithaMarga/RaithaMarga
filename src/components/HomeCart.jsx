import { rupees } from '../lib/money';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/useAuth';
import { useLanguage } from '../context/LanguageContext';
import ListingImage from './dashboard/ListingImage';
import QuantityInput from './QuantityInput';
import CartSummary from './CartSummary';
import './ShoppingCart.css';

export default function HomeCart() {
  const { cart, cartCount, totals, added, changeCartQuantity, removeFromCart, cartError } = useCart();
  const { role, user } = useAuth();
  const { language } = useLanguage();
  const [error, setError] = useState('');
  const dialog = useRef(null);
  const trigger = useRef(null);
  const kn = language === 'kn';
  const buyer = user && role === 'buyer';
  const destination = buyer ? '/buyer/dashboard/cart' : '/login?role=buyer&next=cart';
  useEffect(() => {
    const modal = dialog.current;
    const restore = () => { document.body.style.overflow = ''; trigger.current?.focus(); };
    modal.addEventListener('close', restore);
    return () => { modal.removeEventListener('close', restore); document.body.style.overflow = ''; };
  }, []);
  const act = (fn) => { try { fn(); setError(''); } catch (e) { setError(e.message); } };
  return <>
    <button ref={trigger} key={added} type="button" className={`nav-cart ${added ? 'nav-cart--added' : ''}`} aria-haspopup="dialog" onClick={() => { dialog.current.showModal(); document.body.style.overflow = 'hidden'; }}>
      <span aria-hidden="true">🛒</span> {kn ? 'ಕಾರ್ಟ್' : 'Cart'} • {cartCount}
      {cartCount > 0 && <span className="nav-cart__total"> {kn ? 'ವಸ್ತು' : cartCount === 1 ? 'item' : 'items'} • {rupees(totals.total)}</span>}
    </button>
    <dialog ref={dialog} className="home-cart" aria-labelledby="home-cart-title" onClick={(e) => { if (e.target === e.currentTarget) dialog.current.close(); }}>
      <div className="home-cart__content">
        <header className="home-cart__header"><div><small>RAITHAMARGA · FRESH FROM FARMS</small><h2 id="home-cart-title">{kn ? 'ನಿಮ್ಮ ಕಾರ್ಟ್ / Your Cart' : 'Your Cart / ನಿಮ್ಮ ಕಾರ್ಟ್'}</h2></div><button type="button" aria-label="Close cart" onClick={() => dialog.current.close()}>✕</button></header>
        {(cartError || error) && <p role="alert">{cartError || error}</p>}
        <div className="home-cart__lines">
          {!cart.length && <div className="home-cart__empty"><span>🛒</span><h3>{kn ? 'ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ' : 'Your cart is empty'}</h3><p>{kn ? 'ತಾಜಾ ಬೆಳೆಗಳನ್ನು ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ' : 'Choose fresh produce and type the quantity you need.'}</p><button className="shopping-primary" onClick={() => { dialog.current.close(); window.location.href = '/#crops'; }}>Browse Crops / ಬೆಳೆಗಳು →</button></div>}
          {cart.map((item) => <article className="home-cart__line" key={item.listingId}>
            <ListingImage listing={{ ...item, id: item.listingId }} />
            <div><h3>{item.crop}</h3><p>{rupees(item.expectedPrice)} / {item.unit}</p><QuantityInput disabled={Boolean(item.deal)} value={item.quantity} max={item.availableQuantity} unit={item.unit} label={`${item.crop} cart quantity`} onChange={(value) => act(() => changeCartQuantity(item.listingId, value))} /><p>{item.quantity}{item.unit} × {rupees(item.expectedPrice)} = <strong>{rupees(item.quantity * item.expectedPrice)}</strong></p><button className="shopping-remove" onClick={() => act(() => removeFromCart(item.listingId))}>{kn ? 'ತೆಗೆದುಹಾಕಿ' : 'Remove'}</button></div>
          </article>)}
        </div>
        {cart.length > 0 && <footer className="home-cart__footer"><CartSummary items={cart} /><Link className="shopping-primary" to={destination} onClick={() => dialog.current.close()}>{buyer ? 'Continue to Cart / ಕಾರ್ಟ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ' : 'Login & Pay Now / ಲಾಗಿನ್ ಮಾಡಿ'}</Link><Link className="shopping-secondary" to={buyer ? destination : '/cart'} onClick={() => dialog.current.close()}>View Cart / ಕಾರ್ಟ್ ನೋಡಿ</Link><small>Stock and prices are confirmed before a deal is created.</small></footer>}
      </div>
    </dialog>
  </>;
}
