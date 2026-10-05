import { useCallback, useState } from 'react';
import EmptyState from '../../components/dashboard/EmptyState';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { useAuth } from '../../context/useAuth';
import { adminApi } from '../../lib/adminApi';
import { useAdminResource } from '../../hooks/useAdminResource';
import { formatDateTime, titleCase } from './adminFormat';
import '../../components/dashboard/dashboard-ui.css';

const ROLES = [['', 'All'], ['FARMER', 'Farmers'], ['BUYER', 'Buyers'], ['ADMIN', 'Admins']];
const STATUSES = [['', 'Any status'], ['ACTIVE', 'Active'], ['DISABLED', 'Disabled']];

const AdminUsers = () => {
  const { user } = useAuth();
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [busyUid, setBusyUid] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  const fetcher = useCallback(() => adminApi.users({ role, status }), [role, status]);
  const { data, loading, error, setData } = useAdminResource(fetcher);
  const rows = data || [];

  const changeStatus = async (row, nextStatus) => {
    if (nextStatus === 'DISABLED' && !window.confirm(`Disable ${row.name || row.email}? They will be blocked on their next request.`)) {
      return;
    }
    setBusyUid(row.uid);
    setMessage({ type: '', text: '' });
    try {
      const updated = await adminApi.updateUserStatus(row.uid, nextStatus);
      setData((current) => (current || []).map((item) => (item.uid === row.uid ? { ...item, ...updated } : item)));
      setMessage({ type: 'success', text: `${row.name || row.email} is now ${nextStatus.toLowerCase()}.` });
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
          <h1 className="dash-page__title">Users</h1>
          <p className="dash-page__subtitle">Everyone with an account on the platform.</p>
        </div>
      </div>

      <div className="admin-toolbar">
        <div className="admin-toolbar__group">
          {ROLES.map(([value, label]) => (
            <button key={label} type="button" className={`btn btn--sm ${role === value ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setRole(value)}>{label}</button>
          ))}
        </div>
        <div className="admin-toolbar__group">
          {STATUSES.map(([value, label]) => (
            <button key={label} type="button" className={`btn btn--sm ${status === value ? 'btn--primary' : 'btn--outline'}`}
              onClick={() => setStatus(value)}>{label}</button>
          ))}
        </div>
      </div>

      {message.text ? <div className={`dash-banner dash-banner--${message.type}`}>{message.text}</div> : null}
      {error ? <div className="dash-banner dash-banner--error">{error}</div> : null}

      <div className="dash-panel">
        {loading ? <p>Loading…</p> : rows.length === 0 && !error ? (
          <EmptyState icon="☺" title="No users found" description="Try a different filter." />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Name</th><th>Role</th><th>Status</th><th>Joined</th><th style={{ textAlign: 'right' }}>Action</th></tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const protectedRow = row.role === 'ADMIN' || row.uid === user?.uid;
                  return (
                    <tr key={row.uid}>
                      <td><strong>{row.name || '—'}</strong><span className="admin-table__sub">{row.email}</span></td>
                      <td>{titleCase(row.role)}</td>
                      <td><StatusBadge status={String(row.status || 'ACTIVE').toLowerCase() === 'active' ? 'active' : 'disabled'} /></td>
                      <td>{formatDateTime(row.createdAt)}</td>
                      <td>
                        <div className="admin-table__actions">
                          {protectedRow ? <span className="admin-table__sub">Protected</span> : row.status === 'DISABLED' ? (
                            <button type="button" className="btn btn--sm btn--primary" disabled={busyUid === row.uid}
                              onClick={() => changeStatus(row, 'ACTIVE')}>Enable</button>
                          ) : (
                            <button type="button" className="btn btn--sm btn--outline" disabled={busyUid === row.uid}
                              onClick={() => changeStatus(row, 'DISABLED')}>Disable</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
