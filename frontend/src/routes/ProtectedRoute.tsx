import { Navigate, Outlet } from "react-router-dom";
import Loading from "../components/common/Loading";
import { useAppSelector } from "../store/hooks";


interface ProtectedRouteProps {
    allowedRoles?: ("ADMIN" | "MANAGER" | "STAFF")[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const token = localStorage.getItem("accessToken");

    const user = useAppSelector((state) => state.auth.user);
    const loading = useAppSelector((state) => state.auth.loading);
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (loading) {
        return <Loading />;
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