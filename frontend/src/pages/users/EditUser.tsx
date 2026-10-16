import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { type UserRole } from "../../services/userService";
import Loading from "../../components/common/Loading";
import ErrorState from "../../components/common/ErrorState";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { clearSelectedUser, editUser, fetchUserById } from "../../store/slices/userSlice";

const EditUser = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const selectedUser = useAppSelector((state) => state.user.selectedUser);
  const loading = useAppSelector((state) => state.user.loading);
  const mutationLoading = useAppSelector((state) => state.user.mutationLoading);
  const reduxError = useAppSelector((state) => state.user.mutationError);
  const user = useAppSelector((state) => state.auth.user);

  const isAdmin = user?.role === "ADMIN";
  const isManager = user?.role === "MANAGER";

  const isEditingSelf = user?.id === selectedUser?.id;
  const isEditingAdmin = selectedUser?.role === "ADMIN";
  const isEditingManager = selectedUser?.role === "MANAGER";

  const canEditUser =
    isAdmin ||
    (isManager && (isEditingSelf || (!isEditingAdmin && !isEditingManager)));
  const canEditRole = isAdmin && !isEditingAdmin;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("STAFF");
  const [error, setError] = useState("");
  const [formUserId, setFormUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      return;
    }
    void dispatch(fetchUserById(id));
    return () => {
      dispatch(clearSelectedUser());
    };
  }, [id, dispatch]);

  if (selectedUser && formUserId !== selectedUser.id) {
    setFormUserId(selectedUser.id);
    setName(selectedUser.name);
    setEmail(selectedUser.email);
    setRole(selectedUser.role);
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canEditUser) {
      setError("You do not have permission to edit this user.");
      return;
    }
    if (!id) {
      return;
    }
    if (!name.trim() || !email.trim()) {
      setError("Name and Email are required.");
      return;
    }
    try {
      await dispatch(
        editUser({
          id,
          user: {
            name: name.trim(),
            email: email.trim(),

            ...(canEditRole && {
              role,
            }),
          },
        }),
      ).unwrap();
      navigate("/users");
    } catch (error) {
      console.error("Failed to update user:", error);
      setError(
        typeof error === "string"
          ? error
          : reduxError || "Failed to update user.",
      );
    }
  };

  if (loading && (!selectedUser || selectedUser.id !== id)) {
    return <Loading />;
  }

  if (!id || (reduxError && !selectedUser)) {
    return (
      <div className="products-page">
        <ErrorState
          message={
            !id ? "Invalid user ID." : reduxError || "Unable to load user."
          }
          onRetry={
            id
              ? () => {
                  void dispatch(fetchUserById(id));
                }
              : undefined
          }
        />
      </div>
    );
  }

  if (!selectedUser || selectedUser.id !== id) {
    return (
      <div className="products-page">
        <ErrorState
          message="User not found."
          onRetry={() => {
            void dispatch(fetchUserById(id));
          }}
        />
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-page__header">
        <div>
          <h1>Edit User</h1>
          <p>Update user information and role.</p>
        </div>
      </div>

      <div className="products-card">
        <form className="product-form" onSubmit={handleSubmit}>
          <div className="product-form__group">
            <label htmlFor="name">Name</label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter user name"
              disabled={mutationLoading || !canEditUser}
            />
          </div>

          <div className="product-form__group">
            <label htmlFor="email">Email</label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter email"
              disabled={mutationLoading || !canEditUser}
            />
          </div>

          {canEditRole && (
            <div className="product-form__group">
              <label htmlFor="role">Role</label>

              <select
                id="role"
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                disabled={mutationLoading}
              >
                <option value="STAFF">Staff</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>
          )}

          {(error || reduxError) && (
            <p className="form-error">{error || reduxError}</p>
          )}

          <div className="product-form__actions">
            <button
              className="btn btn--danger"
              type="button"
              onClick={() => navigate("/users")}
              disabled={mutationLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn--primary"
              disabled={
                mutationLoading || !canEditUser || !selectedUser || loading
              }
            >
              {mutationLoading ? "Updating..." : "Update User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
