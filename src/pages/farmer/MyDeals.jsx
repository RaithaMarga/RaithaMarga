import EmptyState from '../../components/dashboard/EmptyState';
import '../../components/dashboard/dashboard-ui.css';

const MyDeals = () => {
  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">My Deals</h1>
          <p className="dash-page__subtitle">Track every deal from confirmation to payment.</p>
        </div>
      </div>

      <div className="dash-panel">
        <EmptyState
          icon="\u2696"
          title="No deals yet"
          description="Once a buyer confirms interest in one of your listings, the deal will appear here with agreed quantity, price, status, and pickup or delivery details."
        />
      </div>
    </div>
  );
};

export default MyDeals;
