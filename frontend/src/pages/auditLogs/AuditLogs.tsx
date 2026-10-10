import { useEffect } from "react"
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAuditLogs, setAuditLogAction, setAuditLogEntity, setAuditLogPage } from "../../store/slices/auditLogSlice";

const AuditLogs = () => {
    const dispatch = useAppDispatch();
    const {logs, page, totalPages, action, entity, loading, error} = useAppSelector((state) => state.auditLog);

    useEffect(() => {
        void dispatch(fetchAuditLogs());
    }, [dispatch, page, action, entity]);

    const formatDate = (date:string) => {
        return new Date(date).toLocaleString();
    };

    const formatAction = (value:string) => {
        return value .replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
    };

    const handleActionChange = (value:string) => {
        dispatch(setAuditLogAction(value));
    };

    const handleEntityChange = (value:string) => {
        dispatch(setAuditLogEntity(value));
    };

    if(error) {
        return (
            <div className="audit-logs-page">
                <ErrorMessage message={error} />
            </div>
        );
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
            <select value={action} onChange={(event) => handleActionChange(event.target.value)}>
                <option value="">All Actions</option>
                <option value="CREATE">Create</option>
                <option value="UPDATE">Update</option>
                <option value="DELETE">Delete</option>
                <option value="ACTIVATE">Activate</option>
                <option value="DEACTIVATE">Deactivate</option>
            </select>

            <select value={entity} onChange={(event) => handleEntityChange(event.target.value)}>
                <option value="">All Entities</option>
                <option value="USER">User</option>
                <option value="Product">Product</option>
                <option value="Category">Category</option>
                <option value="Supplier">Supplier</option>
                <option value="InventoryTransaction">Inventory Transaction</option>
            </select>
        </div>

        <div className="audit-logs-card">
            <div className="audit-logs-table-wrapper">
                <table className="audit-logs-table">
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>User</th>
                            <th>Action</th>
                            <th>Entity</th>
                            <th>Details</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="audit-logs-table__loading"><Loading /></td>
                            </tr>
                        ): logs.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="audit-logs-table__empty">No audit logs found.</td>
                            </tr>
                        ): (
                            logs.map((log) => (
                                <tr key={log.id}>
                                    <td>{formatDate(log.createdAt)}</td>
                                    <td>{log.user ? log.user.name : "System"}</td>
                                    <td>
                                        <span className={`audit-log-action audit-log-action--${log.action.toLowerCase()}`}>
                                            {formatAction(log.action)}
                                        </span>
                                    </td>
                                    <td>{formatAction(log.entity)}</td>
                                    <td>{log.details || "-"}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="audit-logs-pagination">
                    <button type="button" className="btn btn--primary" disabled={page === 1} onClick={() => dispatch(setAuditLogPage(page - 1))}>Previous</button>
                    <span>Page {page} of {" "} {totalPages}</span>
                    <button type="button" className="btn btn--primary" disabled={page === totalPages} onClick={() => dispatch(setAuditLogPage(page + 1))}>Next</button>
            </div>
        </div>
    </div>
  );
};
export default AuditLogs;