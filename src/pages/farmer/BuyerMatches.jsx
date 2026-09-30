import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useFarmerData } from '../../context/FarmerDataContext';
import EmptyState from '../../components/dashboard/EmptyState';
import '../../components/dashboard/dashboard-ui.css';
import { IconHandshake } from '../../components/dashboard/icons';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const BuyerMatches = () => {
  const { listings } = useFarmerData();
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
        console.warn('Could not fetch matches from backend', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, []);

  const handleInitiateDeal = async (match) => {
    try {
      const res = await fetch(`${API_BASE}/deals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: match.listing.id,
          farmerId: match.listing.farmerId,
          farmerName: match.listing.farmerName,
          buyerId: match.requirement.buyerId,
          buyerName: match.requirement.buyerName,
          crop: match.listing.crop,
          quantity: match.requirement.requiredQuantity,
          unit: match.requirement.unit || match.listing.unit,
          agreedPrice: match.listing.expectedPrice
        })
      });
      if (res.ok) {
        navigate('/farmer/dashboard/deals');
      }
    } catch (err) {
      console.error('Failed to initiate deal', err);
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Buyer Matches</h1>
          <p className="dash-page__subtitle">Transparent, rule-based matching based on crop, volume, distance, and price.</p>
        </div>
      </div>

      {loading ? (
        <div className="dash-panel" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Calculating matches from active requirements...</p>
        </div>
      ) : matches.length === 0 ? (
        <div className="dash-panel">
          <EmptyState
            icon={<IconHandshake />}
            title="No buyer matches yet"
            description="Matches will appear here as soon as a registered buyer creates a procurement requirement matching your crop, quantity, and location."
            action={
              <Link to="/farmer/dashboard/add-produce" className="btn btn--primary btn--sm">
                Add Produce Listing
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
                borderLeft: '4px solid #1B4332',
                padding: '1.25rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span
                    style={{
                      background: '#FEF3C7',
                      color: '#92400E',
                      fontWeight: 800,
                      fontSize: '1rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '8px',
                      border: '1px solid #FDE68A'
                    }}
                  >
                    {m.score}% Match
                  </span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#1B4332' }}>
                      {m.requirement.buyerName} &bull; {m.listing.crop}
                    </h3>
                    <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748B' }}>
                      Buyer Location: {m.requirement.location} &bull; Target Price: ₹{m.requirement.targetPrice}/{m.requirement.unit || 'qtl'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleInitiateDeal(m)}
                  className="btn btn--primary btn--sm"
                  style={{ whiteSpace: 'nowrap' }}
                >
                  Initiate Deal &rarr;
                </button>
              </div>

              {/* Match reasons explanation (Prompt 4) */}
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
                  Match Assessment Reasons:
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

export default BuyerMatches;
