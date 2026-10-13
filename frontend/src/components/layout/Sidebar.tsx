import { BarChart3, Boxes, ClipboardList, FileText, LayoutDashboard, Mail, Package, Truck, Users, X } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAppSelector } from "../../store/hooks";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}
const menuItems = [
    {
        label: "Dashboard",path: "/dashboard", icon: LayoutDashboard
    },
    {
        label: "Products", path: "/products", icon: Package
    },
    {
        label: "Categories", path: "/categories", icon: Boxes
    },
    {
        label: "Suppliers", path: "/suppliers", icon: Truck
    },
    {
        label: "Inventory", path: "/inventory", icon: ClipboardList
    }, 
    {
        label: "Transactions", path: "/transactions", icon: BarChart3
    },
    {
        label: "Users", path: "/users", icon: Users
    },
    {
        label: "Audit Logs", path: "/audit-logs", icon: FileText
    },
];

function Sidebar ({isOpen, onClose}: SidebarProps) {
    const user = useAppSelector((state) => state.auth.user);
    const items = menuItems.filter((item) => {
        if(item.path === "/users") {
            return user?.role === "ADMIN" || user?.role === "MANAGER";
        }
        if(item.path === "/audit-logs") {
            return user?.role === "ADMIN" || user?.role === "MANAGER";
        }
        return true;
    });

    if(user?.role === "ADMIN") {
        items.push({
            label: "Email", path: "/email", icon: Mail
        });
    }
    
  return (
    <>
        <div className={`sidebar-overlay ${isOpen ? "sidebar-overlay--visible" : ""}`} onClick={onClose} />
        <aside className={`sidebar ${isOpen ? "sidebar--open" : ""}`}>
            <div className="sidebar__brand">
                <div className="sidebar__logo">
                    <img src="/logo2.png" alt="logo" />
                </div>
                <button type="button" className="sidebar__close" onClick={onClose} aria-label="Close Sidebar"><X size={18} /></button>
            </div>

            <nav className="sidebar__nav">
                {items.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink key={item.path} to={item.path} onClick={onClose} className={({isActive}) => `sidebar__link ${isActive ? "sidebar__link--active" : ""}`} ><Icon size={18} /><span>{item.label}</span></NavLink>
                    );
                })}
            </nav>
            <div className="sidebar__bottom">
                <div className="sidebar__user">
                    <div className="sidebar__avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                    <div className="sidebar__user-info">
                        <strong>{user?.name}</strong>
                        <span>{user?.role}</span>
                    </div>
                </div>
            </div>
        </aside>
    </>
  )
}

export default Sidebar