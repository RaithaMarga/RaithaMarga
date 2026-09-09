import { Link } from 'react-router-dom';
import { useBuyerData } from '../../context/BuyerDataContext';
import EmptyState from '../../components/dashboard/EmptyState';
import '../../components/dashboard/dashboard-ui.css';
import { IconHandshake } from '../../components/dashboard/icons';

const RecommendedMatches = () => {
  const { requirements } = useBuyerData();

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Recommended Matches</h1>
          <p className="dash-page__subtitle">Produce that fits your saved requirements.</p>
        </div>
      </div>

      <div className="dash-panel">
        <EmptyState
          icon={<IconHandshake />}
          title="No recommended matches yet"
          description={
            requirements.length === 0
              ? 'Save a buying requirement on your Profile — crop, quantity, quality, price and location — so we know what to look for once matching is live.'
              : `You have ${requirements.length} saved requirement${requirements.length === 1 ? '' : 's'}. Matching is coming soon — once it\u2019s live, listings that fit your requirements will show up here automatically, with the reason for each match.`
          }
          action={
            requirements.length === 0 ? (
              <Link to="/buyer/dashboard/profile" className="btn btn--primary btn--sm">Add a Requirement</Link>
            ) : (
              <Link to="/buyer/dashboard/browse" className="btn btn--outline btn--sm">Browse Produce Instead</Link>
            )
          }
        />
      </div>
    </div>
  );
};

export default RecommendedMatches;
