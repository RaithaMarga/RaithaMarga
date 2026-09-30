import { useState, useEffect } from 'react';
import EmptyState from '../../components/dashboard/EmptyState';
import '../../components/dashboard/dashboard-ui.css';
import { IconScale } from '../../components/dashboard/icons';

const API_BASE = 'http://localhost:5000/api';

const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDeals = async () => {
    try {
      const res = await fetch(`${API_BASE}/deals`);
      if (res.ok) {
        const data = await res.json();
        setDeals(data.deals || []);
      }
    } catch (err) {
      console.warn('Error fetching deals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { label: 'Settled & Completed', color: '#166534', bg: '#DCFCE7' };
      case 'deal_confirmed':
        return { label: 'Farmer Confirmed', color: '#1E40AF', bg: '#DBEAFE' };
      case 'weighed_proof_added':
        return { label: 'Weighing Verified', color: '#92400E', bg: '#FEF3C7' };
      case 'pickup_delivery':
        return { label: 'In Transit', color: '#4338CA', bg: '#EEF2FF' };
      case 'buyer_interested':
      default:
        return { label: 'Interest Requested', color: '#6B21A8', bg: '#F3E8FF' };
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Deals & Procurement Orders</h1>
          <p className="dash-page__subtitle">Track farmer confirmations, weighing proof slips, and delivery settlements.</p>
        </div>
      </div>

      {loading ? (
        <div className="dash-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading procurement orders...</p>
        </div>
      ) : deals.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon={<IconScale />}
            title="No deals yet"
            description="Once you express interest in a farmer's produce and the terms are accepted, your procurement deal will appear here."
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {deals.map((d) => {
            const badge = getStatusBadge(d.status);
            return (
              <div
                key={d.id}
                className="dash-panel"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  padding: '1.5rem',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', color: '#94A3B8' }}>{d.id}</span>
                    <h3 style={{ margin: '0.2rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
                      {d.crop} &bull; {d.quantity} {d.unit}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#475569' }}>
                      Farmer: <strong>{d.farmerName}</strong> &bull; Agreed Price: ₹{d.agreedPrice}/{d.unit}
                    </p>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#1B4332' }}>
                      ₹{(d.totalAmount || 0).toLocaleString('en-IN')}
                    </div>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '0.25rem',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.25rem 0.65rem',
                        borderRadius: '999px',
                        color: badge.color,
                        background: badge.bg
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
                    gap: '0.5rem',
                    background: '#F8FAFC',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}
                >
                  <div style={{ color: d.status ? '#1B4332' : '#94A3B8' }}>1. Inquiry</div>
                  <div style={{ color: ['deal_confirmed', 'weighed_proof_added', 'pickup_delivery', 'completed'].includes(d.status) ? '#1B4332' : '#94A3B8' }}>2. Confirmed</div>
                  <div style={{ color: ['weighed_proof_added', 'pickup_delivery', 'completed'].includes(d.status) ? '#1B4332' : '#94A3B8' }}>3. Proof Added</div>
                  <div style={{ color: ['pickup_delivery', 'completed'].includes(d.status) ? '#1B4332' : '#94A3B8' }}>4. In Transit</div>
                  <div style={{ color: d.status === 'completed' ? '#166534' : '#94A3B8' }}>5. Settled</div>
                </div>

                {/* Trust & Proof Section (Prompt 6 requirement) */}
                <div style={{ background: d.weighingProof ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${d.weighingProof ? '#BBF7D0' : '#E2E8F0'}`, padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong>Trust & Weighing Verification:</strong>
                    {d.weighingProof ? (
                      <span style={{
                        background: d.weighingProof.status === 'verified' ? '#DCFCE7' : '#FEF3C7',
                        color: d.weighingProof.status === 'verified' ? '#15803D' : '#92400E',
                        padding: '0.15rem 0.5rem',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 800
                      }}>
                        {d.weighingProof.status ? d.weighingProof.status.toUpperCase() : 'VERIFIED'}
                      </span>
                    ) : (
                      <span style={{ background: '#F1F5F9', color: '#64748B', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600 }}>
                        PENDING WEIGHING
                      </span>
                    )}
                  </div>
                  {d.weighingProof ? (
                    <div style={{ marginTop: '0.35rem', color: '#14532D', fontSize: '0.82rem' }}>
                      &check; Weighbridge Slip: <strong>{d.weighingProof.slipNumber || 'WB-CONFIRMED'}</strong> &bull; Weight: <strong>{d.weighingProof.actualWeight} {d.unit}</strong>
                      <br />
                      <span style={{ color: '#15803D' }}>Verified by: {d.weighingProof.verifiedBy || 'APMC Gate Weighbridge'}</span>
                      {d.weighingProof.proofUrl && (
                        <span style={{ marginLeft: '0.75rem' }}>
                          <a href={d.weighingProof.proofUrl} target="_blank" rel="noreferrer" style={{ color: '#047857', textDecoration: 'underline', fontWeight: 600 }}>
                            View Weighbridge Slip &rarr;
                          </a>
                        </span>
                      )}
                    </div>
                  ) : (
                    <div style={{ marginTop: '0.25rem', color: '#64748B' }}>
                      Weighing slip will be calibrated and uploaded at farm-gate pickup prior to dispatch.
                    </div>
                  )}
                </div>

                {/* Delivery & Settlement Actions */}
                {d.status === 'pickup_delivery' && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9' }}>
                    <button
                      onClick={async () => {
                        try {
                          await fetch(`${API_BASE}/deals/${d.id}/status`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ targetStatus: 'completed', note: 'Buyer acknowledged delivery & payment settlement' })
                          });
                          fetchDeals();
                        } catch (err) {
                          console.error(err);
                        }
                      }}
                      className="btn btn--primary btn--sm"
                      style={{ background: '#166534' }}
                    >
                      Acknowledge Delivery & Complete Deal &check;
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Deals;
