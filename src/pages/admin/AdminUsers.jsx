import { useEffect, useState } from 'react';
import { useAuth } from '../../context/useAuth';
import { useAdminData } from '../../context/AdminDataContext';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { AdminErrorNotice, AdminLoading } from './AdminFeedback';
import { formatAdminDate } from './adminUtils';
import './admin-dashboard.css';

const AdminUsers = () => {
  const { user: signedInUser } = useAuth();
  const { users, usersLoading, usersError, loadUsers, setUserStatus } = useAdminData();
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');
  const [workingUid, setWorkingUid] = useState('');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    loadUsers({ role, status }).catch(() => {});
  }, [loadUsers, role, status]);

  const changeStatus = async (account) => {
    const nextStatus = account.status === 'DISABLED' ? 'ACTIVE' : 'DISABLED';
    setWorkingUid(account.uid);
    setNotice(null);
    try {
      await setUserStatus(account.uid, nextStatus);
      setNotice({ type: 'success', message: `${account.name || account.email || account.uid} is now ${nextStatus}.` });
    } catch (error) {
      setNotice({ type: 'error', message: error.message });
    } finally {
      setWorkingUid('');
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <span className="eyebrow admin-eyebrow">Account management</span>
          <h1 className="dash-page__title">Users</h1>
          <p className="dash-page__subtitle">View account status and disable or re-enable non-admin accounts.</p>
        </div>
        <button type="button" className="btn btn--outline" onClick={() => loadUsers({ role, status }).catch(() => {})}>
          Refresh users
        </button>
      </div>

      {usersError ? <AdminErrorNotice error={usersError} /> : null}
      {notice ? (
        <div className={`dash-banner dash-banner--${notice.type === 'success' ? 'success' : 'error'}`} role="status">
          {notice.message}
        </div>
      ) : null}

      <section className="dash-panel">
        <div className="admin-toolbar" style={{ marginBottom: 'var(--space-4)' }}>
          <label className="dash-field">
            <span>Role</span>
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option value="">All roles</option>
              <option value="FARMER">Farmers</option>
              <option value="BUYER">Buyers</option>
              <option value="ADMIN">Admins</option>
            </select>
          </label>
          <label className="dash-field">
            <span>Account status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">All statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="DISABLED">Disabled</option>
            </select>
          </label>
        </div>

        {usersLoading ? <AdminLoading label="Loading users…" /> : null}
        {!usersLoading && !users.length ? (
          <div className="empty-state">
            <h2 className="empty-state__title">No users found</h2>
            <p className="empty-state__description">Try changing the role or status filters.</p>
          </div>
        ) : null}
        {!usersLoading && users.length ? (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>User</th><th>Role</th><th>Status</th><th>Created</th><th>Action</th></tr>
              </thead>
              <tbody>
                {users.map((account) => (
                  <tr key={account.uid}>
                    <td><strong>{account.name || 'Name unavailable'}</strong><small>{account.email || account.uid}</small></td>
                    <td>{account.role || '—'}</td>
                    <td><StatusBadge status={account.status || 'ACTIVE'} /></td>
                    <td>{formatAdminDate(account.createdAt)}</td>
                    <td>
                      {account.role !== 'ADMIN' && account.uid !== signedInUser?.uid ? (
                        <button
                          type="button"
                          className={`btn btn--sm ${account.status === 'DISABLED' ? 'btn--primary' : 'btn--outline'}`}
                          disabled={Boolean(workingUid)}
                          onClick={() => changeStatus(account)}
                        >
                          {account.status === 'DISABLED' ? 'Enable' : 'Disable'}
                        </button>
                      ) : <span className="admin-muted">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </div>
  );
};

export default AdminUsers;
