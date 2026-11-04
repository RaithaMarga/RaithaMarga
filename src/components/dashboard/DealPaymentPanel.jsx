import { useEffect, useState } from 'react';
import { DELIVERABLE_STATUSES, openRazorpayCheckout, paymentApi, PAYABLE_STATUSES } from '../../lib/payments';
import { formatRupees, usePaymentCopy } from '../../i18n/paymentCopy';
import PaymentStatusBadges from './PaymentStatusBadges';
import './dashboard-ui.css';
import './payments.css';

/**
 * Payment section of the deal details page.
 * - Shows the final agreed quantity, price and total payable (total comes from the server).
 * - Pay Now stays disabled, with "Online payment will be available soon.", until the backend reports
 *   that genuine Razorpay credentials are configured. Nothing here can mark a deal as paid.
 */
export default function DealPaymentPanel({ deal, role, onChanged }) {
  const { copy, language } = usePaymentCopy();
  const [config, setConfig] = useState(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (role !== 'buyer') return undefined;
    let active = true;
    paymentApi.config()
      .then((result) => { if (active) setConfig(result); })
      .catch(() => { if (active) setConfig({ enabled: false }); });
    return () => { active = false; };
  }, [role]);

  const unit = deal.unit || 'kg';
  const price = deal.agreedPrice ?? deal.price;
  const total = deal.totalAmount ?? Number(deal.quantity || 0) * Number(price || 0);
  const paid = deal.paymentStatus === 'PAID';
  const payable = PAYABLE_STATUSES.includes(deal.status);
  const closed = deal.status === 'CANCELLED' || deal.status === 'FAILED';
  const enabled = config?.enabled === true;
  const when = (value) => (value ? new Date(value).toLocaleString(language === 'kn' ? 'kn-IN' : 'en-IN') : '');

  const startPayment = async () => {
    if (!enabled || busy) return;
    setError('');
    setMessage('');
    setBusy('order');
    try {
      const order = await paymentApi.createOrder(deal.id);
      setMessage(copy.openingCheckout);
      await openRazorpayCheckout({
        order,
        onPaid: async (response) => {
          setBusy('verify');
          setMessage(copy.verifying);
          try {
            await paymentApi.verify(deal.id, {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            setMessage('');
            await onChanged();
          } catch (verifyError) {
            setError(verifyError.message);
          } finally {
            setBusy('');
          }
        },
        onDismiss: () => { setBusy(''); setMessage(copy.notCompleted); },
        onFailed: () => { setBusy(''); setMessage(copy.notCompleted); },
      });
    } catch (requestError) {
      setError(requestError.message);
      setMessage('');
      setBusy('');
    }
  };

  const confirmDelivery = async () => {
    setError('');
    setBusy('delivery');
    try {
      await paymentApi.confirmDelivery(deal.id);
      await onChanged();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <section className="dash-panel" aria-label={copy.payment}>
      <h2>{copy.payment}</h2>
      <dl className="pay-amounts">
        <div><dt>{copy.agreedQuantity}</dt><dd>{deal.quantity} {unit}</dd></div>
        <div><dt>{copy.agreedPrice(unit)}</dt><dd>{formatRupees(price)}</dd></div>
        <div className="pay-amounts__total"><dt>{copy.totalPayable}</dt><dd>{formatRupees(total)}</dd></div>
      </dl>

      {error && <div className="dash-banner dash-banner--error" role="alert">{error}</div>}

      {role === 'buyer' && !paid && payable && (
        <>
          <button type="button" className="pay-now" disabled={!enabled || Boolean(busy)} aria-describedby="pay-note" onClick={startPayment}>
            {busy ? copy.openingCheckout : copy.payNow}
          </button>
          <p id="pay-note" className={`pay-note${enabled ? '' : ' pay-note--soon'}`} role="status">
            {enabled ? message : copy.comingSoon}
          </p>
        </>
      )}
      {role === 'buyer' && !paid && !payable && (
        <p className="pay-note">{closed ? copy.dealClosed : copy.waitForConfirm}</p>
      )}
      {paid && (
        <p className="pay-note" role="status">
          <strong>{copy.paymentReceived}: {copy.paid}</strong>{deal.paidAt ? ` · ${copy.paidOn} ${when(deal.paidAt)}` : ''}
        </p>
      )}
      {role === 'farmer' && !paid && <p className="pay-note">{copy.farmerNote}</p>}

      <div className="pay-section">
        <PaymentStatusBadges deal={deal} />
        <p className="pay-note">{copy.trackedSeparately}</p>
        {deal.deliveryStatus === 'CONFIRMED' && deal.deliveryConfirmedAt && (
          <p className="pay-note">{copy.deliveryConfirmedOn} {when(deal.deliveryConfirmedAt)}</p>
        )}
        {role === 'farmer' && deal.settlementStatus === 'SETTLED' && deal.settlementReference && (
          <p className="pay-note">{copy.payoutReference}: <strong>{deal.settlementReference}</strong></p>
        )}
      </div>

      {role === 'buyer' && deal.deliveryStatus !== 'CONFIRMED' && DELIVERABLE_STATUSES.includes(deal.status) && (
        <div className="pay-section">
          <h3>{copy.deliveryConfirmation}</h3>
          <p className="pay-note">{copy.deliveryHint}</p>
          <button type="button" className="btn btn--outline btn--sm" disabled={Boolean(busy)} onClick={confirmDelivery}>
            {copy.confirmDelivery}
          </button>
        </div>
      )}
    </section>
  );
}
