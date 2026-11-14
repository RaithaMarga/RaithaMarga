import { useId, useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './ShoppingCart.css';

export default function QuantityInput({ value, max, unit = 'kg', onChange, disabled = false, label = 'Quantity' }) {
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState('');
  const id = useId();
  const { language } = useLanguage();
  const commit = (raw, blur = false) => {
    if (raw === '' && !blur) { setDraft(''); return; }
    const number = Number(raw);
    const next = Math.min(Number(max), Math.max(1, Number.isFinite(number) ? number : 1));
    setError(number > Number(max) ? (language === 'kn' ? `${max} ${unit} ಮಾತ್ರ ಲಭ್ಯ / Only ${max}${unit} available` : `Only ${max}${unit} available`) : number < 1 ? 'Min 1 / ಕನಿಷ್ಠ 1' : '');
    setDraft(null);
    onChange(next);
  };
  return <div className="quantity-field">
    <div className="quantity-control">
      <button type="button" aria-label={`Decrease ${label}`} disabled={disabled || value <= 1} onClick={() => commit(Number(value) - 1)}>−</button>
      <input aria-label={label} aria-describedby={error ? id : undefined} type="number" inputMode="decimal" min="1" max={max} step="0.01" disabled={disabled} value={draft ?? value} onChange={(e) => commit(e.target.value)} onBlur={(e) => commit(e.target.value, true)} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />
      <button type="button" aria-label={`Increase ${label}`} disabled={disabled || value >= Number(max)} onClick={() => commit(Number(value) + 1)}>+</button>
      <span>{unit}</span>
    </div>
    {error && <small id={id} role="status" className="quantity-error">{error}</small>}
  </div>;
}
