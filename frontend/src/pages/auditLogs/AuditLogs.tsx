import { useEffect } from "react";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAuditLogs,setAuditLogAction, setAuditLogEntity, setAuditLogPage } from "../../store/slices/auditLogSlice";

const AuditLogs = () => {
  const dispatch = useAppDispatch();
  const { logs, page, totalPages, action, entity, loading, error } =
    useAppSelector((state) => state.auditLog);

  useEffect(() => {
    void dispatch(fetchAuditLogs());
  }, [dispatch, page, action, entity]);

  const formatDate = (date: string) => new Date(date).toLocaleString();
  const formatAction = (value: string) =>
    value
      .replace(/_/g, " ")
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="audit-logs-page">
      <div className="audit-logs-page__header">
        <div>
          <h1>Audit Logs</h1>
          <p>Track all system activities.</p>
        </div>
      </div>

      <div className="audit-logs-filters">
        <select
          aria-label="Filter by action"
          value={action}
          onChange={(event) => dispatch(setAuditLogAction(event.target.value))}
        >
          <option value="">All Actions</option>
          <option value="CREATE">Create</option>
          <option value="UPDATE">Update</option>
          <option value="DELETE">Delete</option>
          <option value="ACTIVATE">Activate</option>
          <option value="DEACTIVATE">Deactivate</option>
        </select>
        <select
          aria-label="Filter by entity"
          value={entity}
          onChange={(event) => dispatch(setAuditLogEntity(event.target.value))}
        >
          <option value="">All Entities</option>
          <option value="USER">User</option>
          <option value="Product">Product</option>
          <option value="Category">Category</option>
          <option value="Supplier">Supplier</option>
          <option value="InventoryTransaction">Inventory Transaction</option>
        </select>
      </div>

      <div className="audit-logs-card">
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorState
            message={error}
            onRetry={() => {
              void dispatch(fetchAuditLogs());
            }}
          />
        ) : logs.length === 0 ? (
          <EmptyState
            title="No audit logs found"
            message={
              action || entity
                ? "No activities match the selected filters."
                : "No system activities have been recorded yet."
            }
          />
        ) : (
          <div className="audit-logs-table-wrapper">
            <table className="audit-logs-table">
              <thead>
                <tr>
                  <th>Date &amp; Time</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Entity</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td>{formatDate(log.createdAt)}</td>
                    <td>{log.user ? log.user.name : "System"}</td>
                    <td>
                      <span
                        className={`audit-log-action audit-log-action--${log.action.toLowerCase()}`}
                      >
                        {formatAction(log.action)}
                      </span>
                    </td>
                    <td>{formatAction(log.entity)}</td>
                    <td>{log.details || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {!loading && !error && totalPages > 1 && (
          <div className="audit-logs-pagination">
            <button
              type="button"
              className="btn btn--primary"
              disabled={page <= 1}
              onClick={() => dispatch(setAuditLogPage(page - 1))}
            >
              Previous
            </button>
            <span>
              Page {page} of {totalPages}
            </span>
            <button
              type="button"
              className="btn btn--primary"
              disabled={page >= totalPages}
              onClick={() => dispatch(setAuditLogPage(page + 1))}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default AuditLogs;