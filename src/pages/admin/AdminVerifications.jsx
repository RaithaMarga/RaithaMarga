import { useMemo, useState } from 'react';
import { useAdminData } from '../../context/AdminDataContext';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { AdminErrorNotice, AdminLoading } from './AdminFeedback';
import { formatAdminDate } from './adminUtils';
import './admin-dashboard.css';

const STATUS_TABS = ['ALL', 'PENDING', 'VERIFIED', 'REJECTED'];

const AdminVerifications = () => {
  const {
    verificationQueue, loading, error, approve, reject, setVerificationStatus, refresh,
  } = useAdminData();
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [rejecting, setRejecting] = useState(null);
  const [note, setNote] = useState('');
  const [workingUid, setWorkingUid] = useState('');
  const [notice, setNotice] = useState(null);

  const counts = useMemo(() => STATUS_TABS.reduce((result, status) => {
    result[status] = status === 'ALL'
      ? verificationQueue.length
      : verificationQueue.filter((item) => item.verificationStatus === status).length;
    return result;
  }, {}), [verificationQueue]);
  const records = verificationQueue.filter((item) =>
    (statusFilter === 'ALL' || item.verificationStatus === statusFilter)
    && (roleFilter === 'ALL' || item.role === roleFilter));

  const runAction = async (record, action, reason = '') => {
    setWorkingUid(record.uid);
    setNotice(null);
    try {
      if (action === 'VERIFIED') await approve(record);
      else if (action === 'REJECTED') await reject(record, reason);
      else await setVerificationStatus(record, action);
      setNotice({ type: 'success', message: `${record.name || record.uid} updated to ${action}.` });
      setRejecting(null);
      setNote('');
    } catch (actionError) {
      setNotice({ type: 'error', message: actionError.message });
    } finally {
      setWorkingUid('');
    }
  };

  if (loading && !verificationQueue.length) return <AdminLoading label="Loading verification queue…" />;

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <span className="eyebrow admin-eyebrow">Account review</span>
          <h1 className="dash-page__title">Verifications</h1>
          <p className="dash-page__subtitle">Review farmer and buyer profiles and record each decision.</p>
        </div>
        <button type="button" className="btn btn--outline" onClick={() => refresh().catch(() => {})}>
          Refresh queue
        </button>
      </div>
      {error ? <AdminErrorNotice error={error} /> : null}
      {notice ? (
        <div className={`dash-banner dash-banner--${notice.type === 'success' ? 'success' : 'error'}`} role="status">
          {notice.message}
        </div>
      ) : null}

      <section className="dash-panel">
        <div className="admin-toolbar" style={{ justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
          <div className="admin-filter-tabs" role="tablist" aria-label="Filter by verification status">
            {STATUS_TABS.map((status) => (
              <button
                type="button"
                role="tab"
                aria-selected={statusFilter === status}
                className={`btn btn--sm ${statusFilter === status ? 'btn--primary' : 'btn--outline'}`}
                key={status}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'ALL' ? 'All' : status[0] + status.slice(1).toLowerCase()} ({counts[status]})
              </button>
            ))}
          </div>
          <label className="dash-field">
            <span>Profile type</span>
            <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="ALL">Farmers and buyers</option>
              <option value="FARMER">Farmers</option>
              <option value="BUYER">Buyers</option>
            </select>
          </label>
        </div>

        {loading && !verificationQueue.length ? <AdminLoading label="Loading verification queue…" /> : null}
        {!loading && !records.length ? (
          <div className="empty-state">
            <h2 className="empty-state__title">No matching profiles</h2>
            <p className="empty-state__description">There are no profiles for the selected filters.</p>
          </div>
        ) : null}
        {records.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Profile details</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Review note</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={`${record.role}-${record.uid}`}>
                    <td>
                      <strong>{record.name || 'Name unavailable'}</strong>
                      <small>{record.email || record.uid}</small>
                      <small>{record.role}</small>
                    </td>
                    <td>
                      {record.role === 'FARMER'
                        ? <>
                          {record.village || 'Village unavailable'}
                          <small>{[record.taluk, record.district].filter(Boolean).join(', ') || 'Location unavailable'}</small>
                          <small>Land: {record.landAcres ?? '—'} acres</small>
                        </>
                        : <>
                          {record.businessName || 'Business name unavailable'}
                          <small>{record.district || 'District unavailable'}</small>
                        </>}
                    </td>
                    <td>{formatAdminDate(record.createdAt)}</td>
                    <td><StatusBadge status={record.verificationStatus} /></td>
                    <td>{record.verificationNote || '—'}</td>
                    <td>
                      <div className="admin-actions">
                        {record.verificationStatus === 'PENDING' ? (
                          <>
                            <button
                              type="button"
                              className="btn btn--sm btn--primary"
                              disabled={Boolean(workingUid)}
                              onClick={() => runAction(record, 'VERIFIED')}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="btn btn--sm btn--outline"
                              disabled={Boolean(workingUid)}
                              onClick={() => { setRejecting(record); setNote(''); setNotice(null); }}
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="btn btn--sm btn--outline"
                            disabled={Boolean(workingUid)}
                            onClick={() => runAction(record, 'PENDING')}
                          >
                            Return to pending
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      {rejecting ? (
        <div className="admin-modal-backdrop" role="presentation">
          <form
            className="admin-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="reject-heading"
            onSubmit={(event) => {
              event.preventDefault();
              runAction(rejecting, 'REJECTED', note);
            }}
          >
            <h2 id="reject-heading">Reject {rejecting.name || 'profile'}</h2>
            <p>A review note is required and will be saved with the audit record.</p>
            <label className="dash-field">
              <span>Reason for rejection</span>
              <textarea value={note} onChange={(event) => setNote(event.target.value)}
                maxLength={500} required autoFocus />
              <small>{note.length}/500 characters</small>
            </label>
            <div className="admin-modal__actions">
              <button type="button" className="btn btn--outline" disabled={Boolean(workingUid)}
                onClick={() => setRejecting(null)}>
                Cancel
              </button>
              <button type="submit" className="btn btn--primary" disabled={!note.trim() || Boolean(workingUid)}>
                Confirm rejection
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
};

export default AdminVerifications;
