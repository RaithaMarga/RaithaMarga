import './dashboard-ui.css';

const STATUS_META = {
  draft: { label: 'Draft', tone: 'neutral' },
  active: { label: 'Active', tone: 'success' },
  matched: { label: 'Matched', tone: 'gold' },
  sold: { label: 'Sold', tone: 'primary' },
  expired: { label: 'Expired', tone: 'muted' },
  not_submitted: { label: 'Not Submitted', tone: 'neutral' },
  pending: { label: 'Pending Review', tone: 'gold' },
  needs_attention: { label: 'Needs Attention', tone: 'alert' },
  verified: { label: 'Verified', tone: 'success' },
  requested: { label: 'Requested', tone: 'gold' },
  cancelled: { label: 'Cancelled', tone: 'muted' },
  accepted: { label: 'Accepted', tone: 'success' },
  completed: { label: 'Completed', tone: 'primary' },
  Pending_Verification: { label: 'Pending Verification', tone: 'gold' },
};

const StatusBadge = ({ status }) => {
  const meta = STATUS_META[status] || { label: status, tone: 'neutral' };
  return <span className={`status-badge status-badge--${meta.tone}`}>{meta.label}</span>;
};

export default StatusBadge;
