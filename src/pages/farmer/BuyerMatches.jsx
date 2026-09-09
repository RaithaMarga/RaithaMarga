import { Link } from 'react-router-dom';
import { useFarmerData } from '../../context/FarmerDataContext';
import EmptyState from '../../components/dashboard/EmptyState';
import '../../components/dashboard/dashboard-ui.css';
import { IconHandshake } from '../../components/dashboard/icons';

const BuyerMatches = () => {
  const { stats } = useFarmerData();

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Buyer Matches</h1>
          <p className="dash-page__subtitle">Buyers whose requirements line up with your active listings.</p>
        </div>
      </div>

      <div className="dash-panel">
        <EmptyState
          icon={<IconHandshake />}
          title="No buyer matches yet"
          description={
            stats.activeCount === 0
              ? 'Publish an active listing first — matches appear here once a buyer\u2019s requirement lines up with your crop, quantity, location and price.'
              : 'Matching is coming soon. Once it\u2019s live, buyers whose requirements fit your active listings will show up here automatically, with the reason for each match.'
          }
          action={
            stats.activeCount === 0 ? (
              <Link to="/farmer/dashboard/add-produce" className="btn btn--primary btn--sm">Add Produce</Link>
            ) : null
          }
        />
      </div>
    </div>
  );
};

export default BuyerMatches;
