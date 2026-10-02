import { useCallback, useEffect, useState } from 'react';
import StatusBadge from '../../components/dashboard/StatusBadge';
import { getAdminAuditLogs } from '../../lib/adminApi';
import { AdminErrorNotice, AdminLoading } from './AdminFeedback';
import { formatAdminDate } from './adminUtils';
import './admin-dashboard.css';

const AdminAudit = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setLogs(await getAdminAuditLogs());
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    Promise.resolve().then(() => refresh());
  }, [refresh]);

  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <span className="eyebrow admin-eyebrow">Administrative history</span>
          <h1 className="dash-page__title">Audit log</h1>
          <p className="dash-page__subtitle">The 100 most recent account and verification changes.</p>
        </div>
        <button type="button" className="btn btn--outline" onClick={refresh}>Refresh audit log</button>
      </div>
      {error ? <AdminErrorNotice error={error} onRetry={refresh} /> : null}
      {loading ? <AdminLoading label="Loading audit log…" /> : null}
      {!loading && !logs.length ? (
        <section className="dash-panel">
          <div className="empty-state">
            <h2 className="empty-state__title">No audit actions yet</h2>
            <p className="empty-state__description">Admin changes will appear here after they are recorded.</p>
          </div>
        </section>
      ) : null}
      {!loading && logs.length ? (
        <section className="dash-panel">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr><th>Time</th><th>Action</th><th>Target</th><th>Admin</th><th>Note</th><th>Change</th></tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatAdminDate(log.at)}</td>
                    <td><StatusBadge status={log.action || 'UNKNOWN'} /></td>
                    <td>{log.targetUid || '—'}<small>{log.targetRole || ''}</small></td>
                    <td>{log.adminUid || '—'}</td>
                    <td>{log.note || '—'}</td>
                    <td>
                      <div className="admin-json">
                        <strong>Before</strong>: {JSON.stringify(log.before || {})}
                        <br />
                        <strong>After</strong>: {JSON.stringify(log.after || {})}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
};

export default AdminAudit;
