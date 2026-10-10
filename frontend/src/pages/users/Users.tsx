import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash } from "lucide-react";
import Loading from "../../components/common/Loading";
import ErrorMessage from "../../components/common/ErrorMessage";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { changeUserStatus, fetchUsers, removeUser, setRole, setSearchQuery, setStatus, setUserPage } from "../../store/slices/userSlice";
import type { UserRole } from "../../services/userService";

const Users = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {users, page, totalPages, loading, error, role, status} = useAppSelector((state) => state.user);
  const user = useAppSelector((state) => state.auth.user);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const canManageUsers = user?.role === "ADMIN" || user?.role === "MANAGER";
  const canCreate = canManageUsers;
  const canEdit = canManageUsers;
  const canDelete = user?.role === "ADMIN";

  const handleDelete = async (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this user?");
    if (!confirmed) {
      return;
    }
    try {
      setDeleteError("");
      await dispatch(removeUser(id)).unwrap();
    } catch (error) {
      console.error("Failed to delete user:", error);
      setDeleteError("Failed to delete user.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    dispatch(setSearchQuery(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  useEffect(() => {
    void dispatch(fetchUsers());
  }, [dispatch, page, debouncedSearch, role, status]);

  const handleStatusChange = async (id: string, currentStatus: boolean) => {
    try {
      await dispatch(changeUserStatus({id, isActive: !currentStatus})).unwrap();
    } catch (error) {
      console.error("Failed to update user status:", error);
    }
  };

  if (error) {
      return (
          <div className="users-page">
              <ErrorMessage message={error} />
          </div>
      );
  }

  return (
    <div className="users-page">
      {/* Header */}
      <div className="users-page__header">
        <div>
          <h1>Users</h1>
          <p>Manage system users and their roles.</p>
        </div>

        {canCreate && (
          <button type="button" className="btn btn--primary" onClick={() => navigate("/users/create")}>
            Add User
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="users-filters">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(event) => {
            setSearch(event.target.value);
          }}
        /> 

        <select
          value={role}
          onChange={(event) => {
             dispatch(setRole(event.target.value as UserRole | ""));
          }}
        >
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="STAFF">Staff</option>
        </select>

        <select
          value={status}
          onChange={(event) => {
            dispatch(setStatus(event.target.value as "ACTIVE" | "INACTIVE" | ""));
          }}
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>
      </div>

      {/* Users Card */}
      <div className="users-card">
        {deleteError && <ErrorMessage message={deleteError} />}
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="users-table__loading">
                    <Loading />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="users-table__empty"
                  >
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id}>
                    <td>{user.name}</td>

                    <td>{user.email}</td>

                    <td>{user.role}</td>

                    <td>
                      {canManageUsers ? (
                        <button
                          type="button"
                          onClick={() =>
                            handleStatusChange(user.id, user.isActive)
                          }
                        >
                          <span
                            className={`user-status ${
                              user.isActive
                                ? "user-status--active"
                                : "user-status--inactive"
                            }`}
                          >
                            {user.isActive ? "Active" : "Inactive"}
                          </span>
                        </button>
                      ) : (
                        <span
                          className={`user-status ${
                            user.isActive
                              ? "user-status--active"
                              : "user-status--inactive"
                          }`}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      )}
                    </td>

                    <td>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => navigate(`/users/${user.id}/edit`)}
                        >
                          <Edit size={18} color="blue" />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash size={18} color="red" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="users-pagination">
        <button
          type="button" className="btn btn--primary"
          disabled={page === 1}
          onClick={() => dispatch(setUserPage(page - 1))}
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          type="button" className="btn btn--primary"
          disabled={page === totalPages}
          onClick={() => dispatch(setUserPage(page + 1))}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default Users;
