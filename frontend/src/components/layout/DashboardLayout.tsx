import { LogOut, Menu, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useStore } from "react-redux";
import Sidebar from "./Sidebar";
import { logout } from "../../store/slices/authSlice";
import type { AppDispatch, RootState } from "../../store/store";
import { registerInventorySocketListeners } from "../../services/inventorySocketService";
import NotificationDropdown from "../common/NotificationDropdown";
import FirebaseNotificationListener from "../notification/FirebaseNotificationListener";

function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const section = location.pathname.split("/").filter(Boolean)[0] ?? "dashboard";
  const pageTitle = section.replace(/-/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
  const dispatch = useDispatch<AppDispatch>();
  const store = useStore<RootState>();

  useEffect(() => {
    const cleanup = registerInventorySocketListeners(dispatch, store.getState);
    return cleanup;
  }, [dispatch, store]);

  const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="dashboard-layout__content">
        <header className="topbar">
          <div className="topbar__left">
            <button
              type="button"
              className="topbar__menu"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu size={20} />
            </button>
            <div className="topbar__breadcrumb"><span>Workspace</span><ChevronRight size={15} /><strong>{pageTitle}</strong></div>
          </div>

          <div className="topbar__right">
            <NotificationDropdown />
            <FirebaseNotificationListener />

            <div className="topbar__user">
              <button
                type="button"
                className="topbar__logout"
                onClick={handleLogout}
              >
                <LogOut size={16} />

                <span>Logout</span>
              </button>
            </div>
          </div>
        </header>

        <main className="dashboard-layout__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;
