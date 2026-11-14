import { rupees } from '../lib/money';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Footer from '../components/Footer/Footer';
import { useCart } from '../context/CartContext';
import ListingImage from '../components/dashboard/ListingImage';
import QuantityInput from '../components/QuantityInput';
import CartSummary from '../components/CartSummary';
import { useAuth } from '../context/useAuth';
import { useState } from 'react';

export default function GuestCart() {
  const { cart, changeCartQuantity, removeFromCart, cartError } = useCart();
  const { role } = useAuth();
  const [error, setError] = useState('');
  const act = (fn) => { try { fn(); setError(''); } catch (e) { setError(e.message); } };
  return <><Navbar /><main className="public-cart container"><h1>Your Cart / ನಿಮ್ಮ ಕಾರ್ಟ್</h1><p>Fresh produce, directly from farmers · 1% + 1% Platform Fee</p>
    {(error || cartError) && <p role="alert">{error || cartError}</p>}
    {!cart.length ? <p>Your cart is empty. <Link to="/crops">Browse Crops / ಬೆಳೆಗಳು →</Link></p> : <div className="public-cart__layout"><section>{cart.map((item) => <article className="home-cart__line" key={item.listingId}><ListingImage listing={{ ...item, id: item.listingId }} /><div><h2>{item.crop}</h2><p>{rupees(item.expectedPrice)} / {item.unit}</p><QuantityInput disabled={Boolean(item.deal)} value={item.quantity} max={item.availableQuantity} unit={item.unit} label={`${item.crop} cart quantity`} onChange={(value) => act(() => changeCartQuantity(item.listingId, value))} /><p>{item.quantity}{item.unit} × {rupees(item.expectedPrice)} = {rupees(item.quantity * item.expectedPrice)}</p><button className="shopping-remove" onClick={() => act(() => removeFromCart(item.listingId))}>Remove / ತೆಗೆದುಹಾಕಿ</button></div></article>)}</section><aside><CartSummary items={cart} /><Link className="shopping-primary" to={role === 'buyer' ? '/buyer/dashboard/cart' : '/login?role=buyer&next=cart'}>Login & Pay Now / ಮುಂದುವರಿಯಿರಿ</Link><Link className="shopping-secondary" to="/crops">Continue shopping / ಬೆಳೆಗಳು</Link></aside></div>}
  </main><Footer /></>;
}
