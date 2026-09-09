import EmptyState from '../../components/dashboard/EmptyState';
import '../../components/dashboard/dashboard-ui.css';
import { IconScale } from '../../components/dashboard/icons';

const Deals = () => {
  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Deals</h1>
          <p className="dash-page__subtitle">Confirmed purchases, from agreement through delivery.</p>
        </div>
      </div>

      <div className="dash-panel">
        <EmptyState
          icon={<IconScale />}
          title="No deals yet"
          description="Once a farmer confirms one of your requests, it becomes a deal here — with agreed quantity, price, weighing proof, and pickup or delivery status."
        />
      </div>
    </div>
  );
};

export default Deals;
