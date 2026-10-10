import { Bell, LogOut, Menu } from "lucide-react";
import { useState } from "react"
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { useAppDispatch } from "../../store/hooks";
// import { useAppSelector } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";

function DashboardLayout () {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
        const navigate = useNavigate();
        const dispatch = useAppDispatch();
        // const user = useAppSelector((state) => state.auth.user);
    
const handleLogout = async () => {
    await dispatch(logout());
    navigate("/login");
}
  return (
    <div className="dashboard-layout">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            <div className="dashboard-layout__content">
                <header className="topbar">
                    <div className="topbar__left">
                        <button type="button" className="topbar__menu"
                        onClick={() => setSidebarOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
                        {/* <div className="topbar__search"><Search size={16} />
                            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products, categories, suppliers..." />
                        </div> */}
                    </div>
                    <div className="topbar__right">
                        <button type="button" className="topbar__notification" aria-label="Notifications"><Bell size={18} />
                        <span className="topbar__notification-dot" /></button>
                        <div className="topbar__user">
                            {/* <div className="topbar__avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                            <div className="topbar__user-info">
                                <strong>{user?.name.split(" ")[0]}</strong>
                                <span>{user?.role}</span>
                            </div> */}
                            <button type="button" className="topbar__logout" onClick={handleLogout}><LogOut size={16} />
                    <span>Logout</span></button>
                        </div>
                    </div>
                </header>

                <main className="dashboard-layout__main">
                    <Outlet />
                </main>
            </div>
    </div>
  )
}

export default DashboardLayout
