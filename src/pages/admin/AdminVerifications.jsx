import { useCallback, useState } from 'react';
import EmptyState from '../../components/dashboard/EmptyState';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { adminApi } from '../../lib/adminApi';
import { useAdminResource } from '../../hooks/useAdminResource';
import { formatDateTime } from './adminFormat';
import '../../components/dashboard/dashboard-ui.css';

const STATUSES = [['PENDING', 'Pending'], ['VERIFIED', 'Verified'], ['REJECTED', 'Rejected']];
const ROLES = [['', 'All'], ['FARMER', 'Farmers'], ['BUYER', 'Buyers']];

const AdminVerifications = () => {
  const [status, setStatus] = useState('PENDING');
  const [role, setRole] = useState('');
  const [busyUid, setBusyUid] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [rejecting, setRejecting] = useState(null);
  const [note, setNote] = useState('');

  const fetcher = useCallback(() => adminApi.verifications({ role, status }), [role, status]);
  const { data, loading, error, setData } = useAdminResource(fetcher);
  const rows = data || [];

  const submit = async (row, nextStatus, noteText) => {
    setBusyUid(row.uid);
    setMessage({ type: '', text: '' });
    try {
      await adminApi.updateVerification(row.role, row.uid, { status: nextStatus, note: noteText });
      // The row no longer belongs to the current filter, so drop it from the list.
      setData((current) => (current || []).filter((item) => !(item.uid === row.uid && item.role === row.role)));
      setMessage({ type: 'success', text: `${row.name || row.email} marked as ${nextStatus.toLowerCase()}.` });
      setRejecting(null);
      setNote('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setBusyUid('');
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Verifications</h1>
          <p className="dash-page__subtitle">
            Buyers must be verified before they can post requirements or make deals.
          </p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar__group">
          {STATUSES.map(([value, label]) => (
            <button key={value} type="button"
              className={`btn btn--sm ${status === value ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setStatus(value)}>{label}</button>
          ))}
        </div>
        <div className="admin-toolbar__group">
          {ROLES.map(([value, label]) => (
            <button key={label} type="button"
              className={`btn btn--sm ${role === value ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setRole(value)}>{label}</button>
          ))}
        </div>
      </div>

      {message.text ? (
        <div className={`dash-banner dash-banner--${message.type}`}>{message.text}</div>
      ) : null}
      {error ? <div className="dash-banner dash-banner--error">{error}</div> : null}

      <div className="dash-panel">
        {loading ? <p>Loading…</p> : rows.length === 0 && !error ? (
          <EmptyState icon="✓" title="Nothing here" description={`No ${status.toLowerCase()} ${role ? role.toLowerCase() + 's' : 'accounts'} right now.`} />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Applicant</th><th>Type</th><th>Details</th><th>Applied</th><th>Status</th><th style={{ textAlign: 'right' }}>Action</th></tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.role}-${row.uid}`}>
                    <td>
                      <strong>{row.name || '—'}</strong>
                      <span className="admin-table__sub">{row.email}</span>
                    </td>
                    <td>{row.role === 'FARMER' ? 'Farmer' : 'Buyer'}</td>
                    <td>
                      {row.role === 'FARMER' ? (
                        <>
                          {[row.village, row.taluk, row.district].filter(Boolean).join(', ') || '—'}
                          {row.landAcres != null ? <span className="admin-table__sub">{row.landAcres} acres</span> : null}
                        </>
                      ) : (
                        <>
                          {row.businessName || '—'}
                          {row.district ? <span className="admin-table__sub">{row.district}</span> : null}
                        </>
                      )}
                    </td>
                    <td>{formatDateTime(row.createdAt)}</td>
                    <td>
                      <StatusBadge status={String(row.verificationStatus).toLowerCase()} />
                      {row.verificationNote ? <span className="admin-table__sub admin-note">“{row.verificationNote}”</span> : null}
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        {row.verificationStatus !== 'VERIFIED' ? (
                          <button type="button" className="btn btn--sm btn--primary" disabled={busyUid === row.uid}
                            onClick={() => submit(row, 'VERIFIED', null)}>Approve</button>
                        ) : null}
                        {row.verificationStatus !== 'REJECTED' ? (
                          <button type="button" className="btn btn--sm btn--outline" disabled={busyUid === row.uid}
                            onClick={() => { setRejecting(row); setNote(''); }}>
                            {row.verificationStatus === 'VERIFIED' ? 'Revoke' : 'Reject'}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {rejecting ? (
        <div className="admin-modal__scrim" role="dialog" aria-modal="true" aria-labelledby="reject-title">
          <div className="admin-modal">
            <h3 id="reject-title">{rejecting.verificationStatus === 'VERIFIED' ? 'Revoke' : 'Reject'} {rejecting.name || rejecting.email}?</h3>
            <p>Add a short reason. It is saved with the record and shown in the audit log.</p>
            <textarea value={note} maxLength={500} onChange={(e) => setNote(e.target.value)} placeholder="Reason (required)" />
            <div className="admin-modal__actions">
              <button type="button" className="btn btn--sm btn--outline" onClick={() => setRejecting(null)}>Cancel</button>
              <button type="button" className="btn btn--sm btn--danger"
                disabled={!note.trim() || busyUid === rejecting.uid}
                onClick={() => submit(rejecting, 'REJECTED', note.trim())}>Confirm</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default AdminVerifications;
