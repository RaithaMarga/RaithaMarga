import { Link } from 'react-router-dom';
import ListingImage from './ListingImage';
import PaymentStatusBadges from './PaymentStatusBadges';
import { formatRupees, usePaymentCopy } from '../../i18n/paymentCopy';
import './deal-card.css';

const STATUS_TONE = {
  interested: 'gold', confirmed: 'success', in_progress: 'primary',
  completed: 'success-soft', cancelled: 'muted', failed: 'alert',
};

const LeafIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 19c0-9 5-14 15-14 0 10-5 15-14 15" /><path d="M5 19c2-5 5-8 9-10" />
  </svg>
);
const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
const EyeIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const PinIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21z" /><circle cx="12" cy="9.5" r="2.5" />
  </svg>
);

/** One deal: crop and status, final numbers, tracking pills, the other party, and the actions. */
export default function DealCard({ deal, role, actions = [], busy, canView, onAction }) {
  const { copy, language } = usePaymentCopy();
  const unit = deal.unit || deal.listing?.unit || 'kg';
  const crop = deal.crop || deal.listing?.crop || 'Produce';
  const price = deal.price ?? deal.agreedPrice;
  const statusKey = String(deal.status || '').toLowerCase();
  const tone = STATUS_TONE[statusKey] || 'muted';
  const statusText = copy.dealStatuses[String(deal.status).toUpperCase()] || deal.status;
  const otherLabel = role === 'farmer' ? copy.buyer : copy.farmer;
  const otherName = role === 'farmer' ? deal.buyerName : deal.farmerName;
  const place = role === 'farmer' ? '' : deal.listing?.location;
  const created = deal.createdAt
    ? new Date(deal.createdAt).toLocaleString(language === 'kn' ? 'kn-IN' : 'en-IN', { dateStyle: 'medium', timeStyle: 'short' })
    : '';
  const hasForwardAction = actions.some(([status]) => status !== 'CANCELLED');

  return (
    <article className="deal-card">
      <header className="deal-card__head">
        <div className="deal-card__chips">
          <span className="deal-card__crop"><LeafIcon /> {crop}</span>
          <span className={`deal-card__status deal-card__status--${tone}`}>
            {tone === 'success' && <CheckIcon />} {copy.statusWord} · {statusText}
          </span>
        </div>
        <div className="deal-card__meta">
          <strong title={deal.id}>{copy.dealNumber} #{String(deal.id).slice(0, 8).toUpperCase()}</strong>
          {created && <span>{created}</span>}
        </div>
      </header>

      <div className="deal-card__body">
        <div className="deal-card__photo"><ListingImage listing={{ crop }} className="deal-card__img" label={crop} /></div>
        <dl className="deal-card__figures">
          <div><dt>{copy.quantity}</dt><dd>{deal.quantity} {unit}</dd></div>
          <div><dt>{copy.unitPrice}</dt><dd>{formatRupees(price).replace('.00', '')} / {unit}</dd></div>
          <div><dt>{copy.totalAmount}</dt><dd className="deal-card__total">{formatRupees(deal.totalAmount).replace('.00', '')}</dd></div>
        </dl>
      </div>

      {canView && (
        <section className="deal-card__tracking" aria-label={copy.trackingStatus}>
          <h3>{copy.trackingStatus}</h3>
          <PaymentStatusBadges deal={deal} pills />
        </section>
      )}

      <footer className="deal-card__foot">
        <div className="deal-card__party">
          {otherName && (
            <>
              <PinIcon />
              <div>
                <strong>{otherLabel}: {otherName}</strong>
                {place && <span>{place}</span>}
              </div>
            </>
          )}
        </div>
        <div className="deal-card__actions">
          {actions.map(([status, label]) => (
            <button
              key={status}
              type="button"
              className={status === 'CANCELLED' ? 'deal-btn deal-btn--outline' : 'deal-btn deal-btn--solid'}
              disabled={busy}
              onClick={() => onAction(deal.id, status)}
            >
              {busy ? copy.updating : (copy.actionLabels[label] || label)}
            </button>
          ))}
          {canView && (
            <Link
              className={`deal-btn ${hasForwardAction ? 'deal-btn--outline' : 'deal-btn--solid'}`}
              to={`${role === 'farmer' ? '/farmer/dashboard' : '/buyer/dashboard'}/deals/${deal.id}`}
            >
              <EyeIcon /> {copy.viewDeal}
            </Link>
          )}
        </div>
      </footer>
    </article>
  );
}
