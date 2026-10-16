import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash } from "lucide-react";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchSuppliers,
  removeSupplier,
} from "../../store/slices/supplierSlice";

const Suppliers = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // Redux state
  const user = useAppSelector((state) => state.auth.user);

  const { suppliers, loading, error, mutationLoading } = useAppSelector(
    (state) => state.supplier,
  );

  // Local state
  const [deleteError, setDeleteError] = useState("");

  // Role permissions
  const canCreate = user?.role === "ADMIN" || user?.role === "MANAGER";

  const canEdit = user?.role === "ADMIN" || user?.role === "MANAGER";

  const canDelete = user?.role === "ADMIN";

  // Fetch suppliers
  useEffect(() => {
    void dispatch(fetchSuppliers());
  }, [dispatch]);

  // Delete supplier
  const handleDelete = async (id: string) => {
    if (!canDelete || mutationLoading) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this supplier?",
    );

    if (!confirmed) return;

    try {
      setDeleteError("");

      await dispatch(removeSupplier(id)).unwrap();
    } catch (error) {
      console.error("Failed to delete supplier:", error);

      setDeleteError(
        typeof error === "string"
          ? error
          : "Failed to delete supplier. It may be used by existing products.",
      );
    }
  };

  // Retry fetching suppliers
  const handleRetry = () => {
    setDeleteError("");
    void dispatch(fetchSuppliers());
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="suppliers-page">
      {/* Page header */}
      <div className="suppliers-page__header">
        <div>
          <h1>Suppliers</h1>
          <p>Manage your product suppliers.</p>
        </div>

        {canCreate && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={() => navigate("/suppliers/create")}
          >
            Add Supplier
          </button>
        )}
      </div>

      {/* Suppliers card */}
      <div className="suppliers-card">
        {/* Loading state */}
        {loading ? (
          <Loading />
        ) : error ? (
          /* API error state */
          <ErrorState message={error} onRetry={handleRetry} />
        ) : suppliers.length === 0 ? (
          /* Empty state */
          <>
            {deleteError && <ErrorMessage message={deleteError} />}

            <EmptyState
              title="No suppliers found"
              message="Add your first supplier to get started."
            />
          </>
        ) : (
          /* Suppliers table */
          <>
            {deleteError && <ErrorMessage message={deleteError} />}

            <div className="suppliers-table-wrapper">
              <table className="suppliers-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>

                    {(canEdit || canDelete) && <th>Actions</th>}
                  </tr>
                </thead>

                <tbody>
                  {suppliers.map((supplier) => (
                    <tr key={supplier.id}>
                      <td>{supplier.name}</td>

                      <td>{supplier.email}</td>

                      <td>{supplier.phone}</td>

                      {(canEdit || canDelete) && (
                        <td>
                          {/* Edit button */}
                          {canEdit && (
                            <button
                              type="button"
                              className="edit-icon"
                              aria-label={`Edit ${supplier.name}`}
                              title="Edit supplier"
                              onClick={() =>
                                navigate(`/suppliers/${supplier.id}/edit`)
                              }
                            >
                              <Edit size={18} />
                            </button>
                          )}

                          {/* Delete button */}
                          {canDelete && (
                            <button
                              type="button"
                              className="trash-icon"
                              aria-label={`Delete ${supplier.name}`}
                              title="Delete supplier"
                              disabled={mutationLoading}
                              onClick={() => {
                                void handleDelete(supplier.id);
                              }}
                            >
                              <Trash size={18} />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Suppliers;
