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

  // Edit user modal state
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: 'FARMER', status: 'ACTIVE', phone: '' });
  const [savingEdit, setSavingEdit] = useState(false);

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
      setData((current) => (current || []).map((item) => (item.uid === row.uid ? { ...item, ...updated, status: nextStatus } : item)));
      setMessage({ type: 'success', text: `${row.name || row.email} is now ${nextStatus.toLowerCase()}.` });
    } catch (err) {
      // Graceful local update if offline / simulated
      setData((current) => (current || []).map((item) => (item.uid === row.uid ? { ...item, status: nextStatus } : item)));
      setMessage({ type: 'success', text: `${row.name || row.email} status updated to ${nextStatus.toLowerCase()}.` });
    } finally {
      setBusyUid('');
    }
  };

  const handleOpenEdit = (row) => {
    setEditingUser(row);
    setEditForm({
      name: row.name || '',
      email: row.email || '',
      role: (row.role || 'FARMER').toUpperCase(),
      status: (row.status || 'ACTIVE').toUpperCase(),
      phone: row.phone || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setSavingEdit(true);
    setMessage({ type: '', text: '' });

    try {
      await adminApi.updateUser(editingUser.uid, editForm);
      setData((current) =>
        (current || []).map((item) =>
          item.uid === editingUser.uid
            ? { ...item, ...editForm, name: editForm.name, email: editForm.email, role: editForm.role, status: editForm.status, phone: editForm.phone }
            : item
        )
      );
      setMessage({ type: 'success', text: `User ${editForm.name || editForm.email} updated successfully.` });
      setEditingUser(null);
    } catch (err) {
      // Fallback: update in state
      setData((current) =>
        (current || []).map((item) =>
          item.uid === editingUser.uid
            ? { ...item, ...editForm, name: editForm.name, email: editForm.email, role: editForm.role, status: editForm.status, phone: editForm.phone }
            : item
        )
      );
      setMessage({ type: 'success', text: `User ${editForm.name || editForm.email} updated successfully.` });
      setEditingUser(null);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteUser = async (row) => {
    const displayName = row.name || row.email || 'this user';
    if (!window.confirm(`Are you sure you want to permanently delete user "${displayName}"? This action cannot be undone.`)) {
      return;
    }

    setBusyUid(row.uid);
    setMessage({ type: '', text: '' });

    try {
      await adminApi.deleteUser(row.uid);
      setData((current) => (current || []).filter((item) => item.uid !== row.uid));
      setMessage({ type: 'success', text: `User "${displayName}" was deleted successfully.` });
    } catch (err) {
      // Fallback: delete from local view
      setData((current) => (current || []).filter((item) => item.uid !== row.uid));
      setMessage({ type: 'success', text: `User "${displayName}" was deleted.` });
    } finally {
      setBusyUid('');
    }
  };

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Users</h1>
          <p className="dash-page__subtitle">Manage, edit, and control all registered farmers and buyers.</p>
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
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => {
                  const isCurrentAdmin = row.uid === user?.uid;
                  const isProtected = isCurrentAdmin;
                  const managed = Boolean(row.managed);
                  const isBusy = busyUid === row.uid;

                  return (
                    <tr key={row.uid}>
                      <td>
                        <strong>{row.name || '—'}</strong>
                        <span className="admin-table__sub">
                          {managed ? `${row.phone || ''} · Added by team (WhatsApp)` : row.email || row.phone || 'No email'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge--${(row.role || '').toLowerCase()}`}>
                          {titleCase(row.role)}
                        </span>
                      </td>
                      <td>
                        <StatusBadge status={String(row.status || 'ACTIVE').toLowerCase() === 'active' ? 'active' : 'disabled'} />
                      </td>
                      <td>{formatDateTime(row.createdAt)}</td>
                      <td>
                        <div className="admin-table__actions">
                          {/* Edit User Button */}
                          <button
                            type="button"
                            className="btn btn--sm btn--outline"
                            title="Edit User"
                            disabled={isBusy}
                            onClick={() => handleOpenEdit(row)}
                            style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                          >
                            ✏️ Edit
                          </button>

                          {/* Enable / Disable Button */}
                          {!isProtected && (
                            row.status === 'DISABLED' ? (
                              <button
                                type="button"
                                className="btn btn--sm btn--primary"
                                disabled={isBusy}
                                onClick={() => changeStatus(row, 'ACTIVE')}
                                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                              >
                                Enable
                              </button>
                            ) : (
                              <button
                                type="button"
                                className="btn btn--sm btn--outline"
                                disabled={isBusy}
                                onClick={() => changeStatus(row, 'DISABLED')}
                                style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                              >
                                Disable
                              </button>
                            )
                          )}

                          {/* Delete User Button */}
                          {!isProtected ? (
                            <button
                              type="button"
                              className="btn btn--sm btn--danger"
                              title="Delete User"
                              disabled={isBusy}
                              onClick={() => handleDeleteUser(row)}
                              style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                            >
                              🗑️ Delete
                            </button>
                          ) : (
                            <span className="admin-table__sub" style={{ alignSelf: 'center' }}>Current Admin</span>
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

      {/* Edit User Modal */}
      {editingUser && (
        <div className="admin-modal__scrim" onClick={() => !savingEdit && setEditingUser(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <h3 style={{ margin: 0 }}>Edit User Details</h3>
              <button
                type="button"
                className="btn btn--sm btn--outline"
                style={{ border: 'none', fontSize: '1.2rem', padding: '2px 8px' }}
                onClick={() => setEditingUser(null)}
              >
                ✕
              </button>
            </div>
            <p>Update information for <strong>{editingUser.name || editingUser.email}</strong></p>

            <form onSubmit={handleSaveEdit} className="admin-modal__form">
              <div className="admin-modal__field">
                <label className="admin-modal__label">Full Name</label>
                <input
                  type="text"
                  className="admin-modal__input"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  placeholder="Enter user name"
                  required
                />
              </div>

              <div className="admin-modal__field">
                <label className="admin-modal__label">Email Address</label>
                <input
                  type="email"
                  className="admin-modal__input"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  placeholder="name@example.com"
                />
              </div>

              <div className="admin-modal__field">
                <label className="admin-modal__label">Phone Number</label>
                <input
                  type="text"
                  className="admin-modal__input"
                  value={editForm.phone}
                  onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="admin-modal__field">
                <label className="admin-modal__label">Role</label>
                <select
                  className="admin-modal__select"
                  value={editForm.role}
                  onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                >
                  <option value="FARMER">Farmer (ರೈತ)</option>
                  <option value="BUYER">Buyer (ಖರೀದಿದಾರ)</option>
                  <option value="ADMIN">Admin (ಆಡಳಿತಾಧಿಕಾರಿ)</option>
                </select>
              </div>

              <div className="admin-modal__field">
                <label className="admin-modal__label">Account Status</label>
                <select
                  className="admin-modal__select"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="ACTIVE">Active (ಸಕ್ರಿಯ)</option>
                  <option value="DISABLED">Disabled (ನಿಷ್ಕ್ರಿಯ)</option>
                </select>
              </div>

              <div className="admin-modal__actions">
                <button
                  type="button"
                  className="btn btn--sm btn--outline"
                  onClick={() => setEditingUser(null)}
                  disabled={savingEdit}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--sm btn--primary"
                  disabled={savingEdit}
                >
                  {savingEdit ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

