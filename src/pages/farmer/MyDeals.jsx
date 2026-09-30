import { useState, useEffect } from 'react';
import EmptyState from '../../components/dashboard/EmptyState';
import '../../components/dashboard/dashboard-ui.css';
import { IconScale } from '../../components/dashboard/icons';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const MyDeals = () => {
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

  const handleUpdateStatus = async (dealId, targetStatus) => {
    try {
      const res = await fetch(`${API_BASE}/deals/${dealId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetStatus })
      });
      if (res.ok) {
        fetchDeals();
      }
    } catch (err) {
      console.error('Failed to update deal status', err);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return { label: 'Completed', color: '#166534', bg: '#DCFCE7' };
      case 'deal_confirmed':
        return { label: 'Deal Confirmed', color: '#1E40AF', bg: '#DBEAFE' };
      case 'weighed_proof_added':
        return { label: 'Proof Verified', color: '#92400E', bg: '#FEF3C7' };
      case 'pickup_delivery':
        return { label: 'In Transit / Pickup', color: '#4338CA', bg: '#EEF2FF' };
      case 'buyer_interested':
      default:
        return { label: 'Inquiry / Interest', color: '#6B21A8', bg: '#F3E8FF' };
    }
  };

  const [proofModalDeal, setProofModalDeal] = useState(null);
  const [proofForm, setProofForm] = useState({ actualWeight: '', slipNumber: '', proofUrl: '', notes: '' });
  const [submittingProof, setSubmittingProof] = useState(false);

  const openProofModal = (deal) => {
    setProofModalDeal(deal);
    setProofForm({
      actualWeight: deal.quantity,
      slipNumber: `WB-${Math.floor(100000 + Math.random() * 900000)}`,
      proofUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80',
      notes: 'APMC Electronic weighbridge certified slip'
    });
  };

  const handleAttachProof = async (e) => {
    e.preventDefault();
    if (!proofModalDeal) return;
    setSubmittingProof(true);
    try {
      const res = await fetch(`${API_BASE}/deals/${proofModalDeal.id}/proof`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proofForm)
      });
      if (res.ok) {
        setProofModalDeal(null);
        fetchDeals();
      }
    } catch (err) {
      console.error('Failed to attach proof', err);
    } finally {
      setSubmittingProof(false);
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">My Deals</h1>
          <p className="dash-page__subtitle">Track active trade contracts, weighing slips, and completion settlements.</p>
        </div>
      </div>

      {loading ? (
        <div className="dash-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Loading active deals...</p>
        </div>
      ) : deals.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon={<IconScale />}
            title="No deals yet"
            description="Once a buyer accepts your produce listing or an automated match is accepted, the deal contract will appear here."
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
                      Buyer: <strong>{d.buyerName}</strong> &bull; Agreed Price: ₹{d.agreedPrice}/{d.unit}
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

                {/* State Progress Stepper */}
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
                  <div style={{ color: d.status ? '#1B4332' : '#94A3B8' }}>1. Interest</div>
                  <div style={{ color: ['deal_confirmed', 'weighed_proof_added', 'pickup_delivery', 'completed'].includes(d.status) ? '#1B4332' : '#94A3B8' }}>2. Confirmed</div>
                  <div style={{ color: ['weighed_proof_added', 'pickup_delivery', 'completed'].includes(d.status) ? '#1B4332' : '#94A3B8' }}>3. Proof Added</div>
                  <div style={{ color: ['pickup_delivery', 'completed'].includes(d.status) ? '#1B4332' : '#94A3B8' }}>4. In Transit</div>
                  <div style={{ color: d.status === 'completed' ? '#166534' : '#94A3B8' }}>5. Settled</div>
                </div>

                {/* Proof & Trust Section (Prompt 5 & 6) */}
                {d.weighingProof && (
                  <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', padding: '0.85rem 1rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: '#166534' }}>
                        &check; Verified Weighing Slip: {d.weighingProof.slipNumber || 'WB-CONFIRMED'}
                      </span>
                      <span style={{ background: '#DCFCE7', color: '#15803D', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {d.weighingProof.status ? d.weighingProof.status.toUpperCase() : 'VERIFIED'}
                      </span>
                    </div>
                    <div style={{ marginTop: '0.35rem', color: '#14532D', fontSize: '0.82rem' }}>
                      Certified Weight: <strong>{d.weighingProof.actualWeight} {d.unit}</strong> &bull; Verified By: {d.weighingProof.verifiedBy || 'APMC Gate Weighbridge'}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.85rem', color: '#64748B' }}>
                    Scheduled Pickup: <strong>{d.pickupDate || 'To be scheduled'}</strong>
                  </span>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {d.status === 'buyer_interested' && (
                      <button
                        onClick={() => handleUpdateStatus(d.id, 'deal_confirmed')}
                        className="btn btn--primary btn--sm"
                      >
                        Accept & Confirm Deal
                      </button>
                    )}
                    {d.status === 'deal_confirmed' && (
                      <button
                        onClick={() => openProofModal(d)}
                        className="btn btn--primary btn--sm"
                        style={{ background: '#D97706', borderColor: '#D97706' }}
                      >
                        Upload Weighing Proof &rarr;
                      </button>
                    )}
                    {d.status === 'weighed_proof_added' && (
                      <button
                        onClick={() => handleUpdateStatus(d.id, 'pickup_delivery')}
                        className="btn btn--primary btn--sm"
                      >
                        Mark Ready for Pickup
                      </button>
                    )}
                    {d.status === 'pickup_delivery' && (
                      <button
                        onClick={() => handleUpdateStatus(d.id, 'completed')}
                        className="btn btn--primary btn--sm"
                        style={{ background: '#166534' }}
                      >
                        Confirm Settlement
                      </button>
                    )}
                    {d.status === 'completed' && (
                      <span style={{ color: '#166534', fontWeight: 700, fontSize: '0.85rem' }}>
                        &check; Deal Complete & Settled
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Weighing Proof Modal */}
      {proofModalDeal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '1rem'
        }}>
          <div style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            maxWidth: '480px',
            width: '100%',
            padding: '1.5rem',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>
              Attach Weighing Slip & Evidence
            </h2>
            <p style={{ margin: '0 0 1rem 0', fontSize: '0.85rem', color: '#64748B' }}>
              Record calibrated weighbridge figures for {proofModalDeal.crop} ({proofModalDeal.id})
            </p>

            <form onSubmit={handleAttachProof} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Certified Weight ({proofModalDeal.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={proofForm.actualWeight}
                  onChange={(e) => setProofForm({ ...proofForm, actualWeight: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Weighbridge Slip Number
                </label>
                <input
                  type="text"
                  required
                  value={proofForm.slipNumber}
                  onChange={(e) => setProofForm({ ...proofForm, slipNumber: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                  Receipt / Proof Image URL
                </label>
                <input
                  type="text"
                  value={proofForm.proofUrl}
                  onChange={(e) => setProofForm({ ...proofForm, proofUrl: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem 0.75rem', borderRadius: '8px', border: '1px solid #CBD5E1' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setProofModalDeal(null)}
                  className="btn btn--outline btn--sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingProof}
                  className="btn btn--primary btn--sm"
                  style={{ background: '#166534' }}
                >
                  {submittingProof ? 'Saving...' : 'Confirm & Attach Proof'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyDeals;
