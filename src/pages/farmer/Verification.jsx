import { useFarmerData } from '../../context/FarmerDataContext';
import StatusBadge from '../../components/dashboard/StatusBadge';
import '../../components/dashboard/dashboard-ui.css';

export default function Verification() {
  const { verification } = useFarmerData();

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Verification</h1>
          <p className="dash-page__subtitle">The current backend does not expose farmer document verification.</p>
        </div>
        <StatusBadge status={verification.status} />
      </div>
      <div className="dash-panel">
        <div className="dash-banner dash-banner--error" role="status">
          No verification documents were uploaded or submitted. Ask the RaithaMarga team to add a backend verification endpoint before using this feature.
        </div>
      </div>
    </div>
  );
}
