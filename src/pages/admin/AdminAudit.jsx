import { useMemo, useState } from 'react';
import EmptyState from '../../components/dashboard/EmptyState';
import { adminApi } from '../../lib/adminApi';
import { useAdminResource } from '../../hooks/useAdminResource';
import { formatDateTime, shortId, titleCase } from './adminFormat';
import '../../components/dashboard/dashboard-ui.css';

const EMPTY_ROWS = [];

const change = (entry) => {
  const before = entry.fromStatus ?? entry.before?.verificationStatus ?? entry.before?.status;
  const after = entry.toStatus ?? entry.after?.verificationStatus ?? entry.after?.status;
  return before || after ? `${before || '—'} → ${after || '—'}` : '—';
};

const AdminAudit = () => {
  const { data, loading, error, reload } = useAdminResource(adminApi.auditLogs);
  const [actionFilter, setActionFilter] = useState('');
  const allRows = data || EMPTY_ROWS;
  const actions = useMemo(() => [...new Set(allRows.map((entry) => entry.action).filter(Boolean))].sort(), [allRows]);
  const rows = actionFilter ? allRows.filter((entry) => entry.action === actionFilter) : allRows;
  return (
    <div className="dash-page">
      <div className="dash-page__header">
        <div>
          <h1 className="dash-page__title">Audit log</h1>
          <p className="dash-page__subtitle">The latest 100 actions by administrators and buyers.</p>
        </div>
        <button type="button" className="btn btn--sm btn--outline" onClick={reload}>Refresh</button>
      </div>
      {error ? <div className="dash-banner dash-banner--error">{error}</div> : null}
      <div className="dash-panel">
        <div className="dash-field" style={{ maxWidth: 300, marginBottom: 'var(--space-4)' }}>
          <label htmlFor="audit-action-filter">Filter by action</label>
          <select id="audit-action-filter" value={actionFilter} onChange={(event) => setActionFilter(event.target.value)}>
            <option value="">All actions</option>
            {actions.map((action) => <option key={action} value={action}>{titleCase(action)}</option>)}
          </select>
        </div>
        {loading ? <p>Loading…</p> : rows.length === 0 && !error ? (
          <EmptyState icon="☷" title="No actions recorded" description={actionFilter ? 'No audit entries match this action.' : 'Approvals, rejections and account changes will be listed here.'} />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>When</th><th>Action</th><th>Target</th><th>Change</th><th>Note</th><th>Actor</th></tr></thead>
              <tbody>
                {rows.map((entry) => (
                  <tr key={entry.id}>
                    <td>{formatDateTime(entry.at)}</td>
                    <td>{titleCase(entry.action)}</td>
                    <td>{entry.targetName || titleCase(entry.targetRole)}<span className="admin-table__sub admin-table__mono">{shortId(entry.targetId || entry.targetUid)}</span></td>
                    <td>{change(entry)}</td>
                    <td>{entry.note || '—'}</td>
                    <td>{entry.adminName || shortId(entry.adminUid)}{entry.adminEmail ? <span className="admin-table__sub">{entry.adminEmail}</span> : null}</td>
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
