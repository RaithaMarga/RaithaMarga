import EmptyState from '../../components/dashboard/EmptyState';
import { adminApi } from '../../lib/adminApi';
import { useAdminResource } from '../../hooks/useAdminResource';
import { formatDateTime, shortId, titleCase } from './adminFormat';
import '../../components/dashboard/dashboard-ui.css';

const change = (entry) => {
  const before = entry.before?.verificationStatus ?? entry.before?.status;
  const after = entry.after?.verificationStatus ?? entry.after?.status;
  return before || after ? `${before || '—'} → ${after || '—'}` : '—';
};

const AdminAudit = () => {
  const { data, loading, error, reload } = useAdminResource(adminApi.auditLogs);
  const rows = data || [];
  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Audit log</h1>
          <p className="dash-page__subtitle">The latest 100 actions taken by administrators.</p>
        </div>
        <button type="button" className="btn btn--sm btn--outline" onClick={reload}>Refresh</button>
      </div>
      {error ? <div className="dash-banner dash-banner--error">{error}</div> : null}
      <div className="dash-panel">
        {loading ? <p>Loading…</p> : rows.length === 0 && !error ? (
          <EmptyState icon="☷" title="No actions recorded" description="Approvals, rejections and account changes will be listed here." />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>When</th><th>Action</th><th>Target</th><th>Change</th><th>Note</th><th>Admin</th></tr></thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDateTime(entry.at)}</td>
                    <td>{titleCase(entry.action)}</td>
                    <td>{titleCase(entry.targetRole)}<span className="admin-table__sub admin-table__mono">{shortId(entry.targetUid)}</span></td>
                    <td>{change(entry)}</td>
                    <td>{entry.note || '—'}</td>
                    <td className="admin-table__mono">{shortId(entry.adminUid)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAudit;
