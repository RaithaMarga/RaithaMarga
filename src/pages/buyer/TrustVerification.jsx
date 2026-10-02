import { useBuyerData } from '../../context/BuyerDataContext';
import '../../components/dashboard/dashboard-ui.css';

export default function TrustVerification() {
  const { requests } = useBuyerData();

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Trust & Verification</h1>
          <p className="dash-page__subtitle">Verification information currently available from the backend.</p>
        </div>
      </div>
      <div className="dash-panel">
        <div className="dash-banner dash-banner--error" role="status">
          The backend does not provide a farmer directory, farmer verification-document submission, or public verification details. This page cannot verify or certify a farmer.
        </div>
        <p>Your account currently has {requests.length} deal{requests.length === 1 ? '' : 's'} in the backend marketplace.</p>
      </div>
    </div>
  );
}
