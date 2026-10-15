import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Edit, Trash, UserPlus, UsersRound, ShieldCheck, UserCheck } from "lucide-react";
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

  const activeUsers = users.filter((entry) => entry.isActive).length;
  const adminUsers = users.filter((entry) => entry.role === "ADMIN").length;
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
            <UserPlus size={17} aria-hidden="true" /> Add User
          </button>
        )}
      </div>

      <div className="users-overview" aria-label="Current page user statistics">
        <div className="users-overview__card"><span className="users-overview__icon"><UsersRound size={20} /></span><div><span>Users on this page</span><strong>{users.length}</strong></div></div>
        <div className="users-overview__card"><span className="users-overview__icon users-overview__icon--green"><UserCheck size={20} /></span><div><span>Active users</span><strong>{activeUsers}</strong></div></div>
        <div className="users-overview__card"><span className="users-overview__icon users-overview__icon--purple"><ShieldCheck size={20} /></span><div><span>Admins on this page</span><strong>{adminUsers}</strong></div></div>
      </div>
      {/* Filters */}
      <div className="users-filters">
        <input
          aria-label="Search users"
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
                    <td><div className="users-identity"><span className="users-identity__avatar" aria-hidden="true">{user.name?.trim().charAt(0).toUpperCase() || "U"}</span><strong>{user.name}</strong></div></td>

                    <td>{user.email}</td>

                    <td><span className={`users-role users-role--${user.role.toLowerCase()}`}>{user.role}</span></td>

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
                          type="button" className="edit-icon"
                          aria-label={`Edit ${user.name}`}
                          onClick={() => navigate(`/users/${user.id}/edit`)}
                        >
                          <Edit size={18} />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button" className="trash-icon"
                          aria-label={`Delete ${user.name}`}
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash size={18} />
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
