import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import EmptyState from '../../components/dashboard/EmptyState';
import '../../components/dashboard/dashboard-ui.css';
import { IconHandshake } from '../../components/dashboard/icons';

const API_BASE = 'http://localhost:5000/api';

const RecommendedMatches = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchMatches() {
      try {
        const res = await fetch(`${API_BASE}/matches`);
        if (res.ok) {
          const data = await res.json();
          setMatches(data.matches || []);
        }
      } catch (err) {
        console.warn('Error fetching buyer matches', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  const handleExpressInterest = async (m) => {
    try {
      const res = await fetch(`${API_BASE}/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: m.listing.id,
          farmerId: m.listing.farmerId,
          farmerName: m.listing.farmerName,
          buyerId: m.requirement.buyerId,
          buyerName: m.requirement.buyerName,
          crop: m.listing.crop,
          quantity: m.requirement.requiredQuantity,
          unit: m.requirement.unit || m.listing.unit,
          agreedPrice: m.listing.expectedPrice
        })
      });
      if (res.ok) {
        navigate('/buyer/dashboard/deals');
      }
    } catch (err) {
      console.error('Error expressing interest', err);
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Recommended Matches</h1>
          <p className="dash-page__subtitle">Curated farmer produce matching your procurement requirements.</p>
        </div>
      </div>

      {loading ? (
        <div className="dash-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Finding matching farmer listings...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon={<IconHandshake />}
            title="No recommended matches yet"
            description="Active listings that match your crop, lot volume, location, and target price will appear here."
            action={
              <Link to="/buyer/dashboard/browse" className="btn btn--primary btn--sm">
                Browse Produce Marketplace
              </Link>
            }
          />
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {matches.map((m) => (
            <div
              key={m.id || `${m.listing.id}-${m.requirement.id}`}
              className="dash-panel"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
                borderLeft: '4px solid #D97706',
                padding: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      background: '#DCFCE7',
                      color: '#166534',
                      fontWeight: 800,
                      fontSize: '1rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px'
                    }}
                  >
                    {m.score}% Match
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                      {m.listing.crop} &bull; {m.listing.quantity} {m.listing.unit} Available
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                      Farmer: {m.listing.farmerName} &bull; Location: {m.listing.location} &bull; Asking: ₹{m.listing.expectedPrice}/{m.listing.unit}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleExpressInterest(m)}
                  className="btn btn--primary btn--sm"
                  style={{ background: '#1B4332' }}
                >
                  Express Interest &rarr;
                </button>
              </div>

              <div
                style={{
                  background: '#F8FAFC',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                  color: '#334155'
                }}
              >
                <strong style={{ display: 'block', marginBottom: '0.25rem', color: '#0F172A' }}>
                  Match Highlights:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '1.2rem', lineHeight: '1.4' }}>
                  {m.reasons.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendedMatches;
