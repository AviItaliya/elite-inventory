import { Navigate, Outlet } from "react-router-dom";
import Loading from "../components/common/Loading";
import { useAppSelector } from "../store/hooks";

interface ProtectedRouteProps {
  allowedRoles?: ("ADMIN" | "MANAGER" | "STAFF")[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { user, loading } = useAppSelector((state) => state.auth);
  if (loading) {
    return <Loading fullScreen />;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;