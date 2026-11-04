import { usePaymentCopy } from '../../i18n/paymentCopy';
import './payments.css';

/** Payment received / delivery confirmation / farmer settlement: three separate statuses. */
export default function PaymentStatusBadges({ deal, compact = false, pills = false }) {
  const { copy } = usePaymentCopy();
  const payment = deal.paymentStatus === 'PAID' ? { label: copy.paid, tone: 'success' } : { label: copy.pending, tone: 'gold' };
  const delivery = deal.deliveryStatus === 'CONFIRMED' ? { label: copy.confirmed, tone: 'success' } : { label: copy.pending, tone: 'gold' };
  const settlement = {
    SETTLED: { label: copy.settled, tone: 'success' },
    READY: { label: copy.ready, tone: 'gold' },
  }[deal.settlementStatus] || { label: copy.notDue, tone: 'muted' };
  const rows = [
    [copy.paymentReceived, payment],
    [copy.deliveryConfirmation, delivery],
    [copy.farmerSettlement, settlement],
  ];
  if (pills) {
    // "Payment received · Pending" style pills, used on the deal cards.
    return (
      <ul className="pay-pills">
        {rows.map(([label, status]) => (
          <li key={label} className={`pay-pill pay-pill--${status.tone}`}>
            <span className="pay-pill__dot" aria-hidden="true" />
            {label} · {status.label}
          </li>
        ))}
      </ul>
    );
  }
  return (
    <ul className={`pay-badges${compact ? ' pay-badges--compact' : ''}`}>
      {rows.map(([label, status]) => (
        <li key={label}>
          <span className="pay-badges__label">{label}</span>
          <span className={`status-badge status-badge--${status.tone}`}>{status.label}</span>
        </li>
      ))}
    </ul>
  );
}
