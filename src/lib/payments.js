import { apiRequest } from './api';

/**
 * Payment API. Everything here talks to the backend, which decides whether online payment is on.
 * Nothing in this file marks anything as paid: only the backend can, after verifying with Razorpay.
 */
export const paymentApi = {
  config: () => apiRequest('/payments/config'),
  createOrder: (dealId) => apiRequest(`/payments/deals/${encodeURIComponent(dealId)}/order`, { method: 'POST' }),
  verify: (dealId, body) =>
    apiRequest(`/payments/deals/${encodeURIComponent(dealId)}/verify`, { method: 'POST', body: JSON.stringify(body) }),
  confirmDelivery: (dealId) =>
    apiRequest(`/payments/deals/${encodeURIComponent(dealId)}/delivery-confirmation`, { method: 'POST' }),
  settle: (dealId, body) =>
    apiRequest(`/payments/deals/${encodeURIComponent(dealId)}/settlement`, { method: 'POST', body: JSON.stringify(body) }),
};

export const PAYABLE_STATUSES = ['CONFIRMED', 'IN_PROGRESS', 'COMPLETED'];
export const DELIVERABLE_STATUSES = ['IN_PROGRESS', 'COMPLETED'];

const CHECKOUT_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

function loadCheckoutScript() {
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = CHECKOUT_SRC;
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load the secure payment window.'));
    document.body.appendChild(script);
  });
}

/**
 * Opens Razorpay Checkout for an order the backend created.
 * NOT YET TESTED against a live Razorpay account: this only runs once the backend reports
 * payments as enabled, which requires real credentials. It never reports success by itself;
 * the caller must send the signed response to the backend for verification.
 */
export async function openRazorpayCheckout({ order, onPaid, onDismiss, onFailed }) {
  await loadCheckoutScript();
  const checkout = new window.Razorpay({
    key: order.keyId,
    order_id: order.orderId,
    amount: order.amountPaise,
    currency: order.currency,
    name: 'RaithaMarga',
    description: order.description,
    theme: { color: '#14532d' },
    handler: onPaid, // receives razorpay_order_id, razorpay_payment_id, razorpay_signature
    modal: { ondismiss: onDismiss },
  });
  checkout.on('payment.failed', onFailed);
  checkout.open();
}
