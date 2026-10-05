import { verificationKey } from '../../lib/verification';
import './dashboard-ui.css';

const COPY = {
  buyer: {
    pending: 'Your account is waiting for approval by the RaithaMarga team. You can browse produce now; posting requirements and making deals unlock once you are approved.',
    rejected: 'Your account was not approved.',
  },
  farmer: {
    pending: 'Your account is being reviewed by the RaithaMarga team.',
    rejected: 'Your account was not approved.',
  },
};

const VerificationNotice = ({ user, role }) => {
  const key = verificationKey(user);
  const message = COPY[role]?.[key];
  if (!message) return null;
  const note = user?.profile?.verificationNote;
  return (
    <div className={`dash-banner ${key === 'rejected' ? 'dash-banner--error' : ''}`} role="status">
      {message}
      {key === 'rejected' && note ? ` Reason: ${note}` : ''}
      {key === 'rejected' ? ' Please contact the RaithaMarga team on WhatsApp.' : ''}
    </div>
  );
};

export default VerificationNotice;
