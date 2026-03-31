import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard, Users, Package,
  ShoppingCart, Truck, LogOut
} from "lucide-react";

const links = [
  { to:"/dashboard", label:"Dashboard", icon:LayoutDashboard, roles:["admin","manager","warehouse_staff"] },
  { to:"/suppliers",  label:"Suppliers",  icon:Users,          roles:["admin","manager"] },
  { to:"/inventory",  label:"Inventory",  icon:Package,        roles:["admin","manager","warehouse_staff"] },
  { to:"/orders",     label:"Orders",     icon:ShoppingCart,   roles:["admin","manager","warehouse_staff"] },
  { to:"/shipments",  label:"Shipments",  icon:Truck,          roles:["admin","manager"] },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const allowed = links.filter(l => l.roles.includes(user?.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-logo">⛓</div>
        <div>
          <div className="brand-text">SupplyChain</div>
          <div className="brand-sub">Management System</div>
        </div>
      </div>

      <div className="sidebar-user">
        <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
        <div>
          <p className="user-name">{user?.name}</p>
          <p className="user-role">{user?.role?.replace(/_/g, " ")}</p>
        </div>
      </div>

      <p className="sidebar-section-label">Navigation</p>

      <nav className="sidebar-nav">
        {allowed.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
          >
            <span className="nav-icon"><Icon size={17}/></span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={logout}>
          <LogOut size={16}/>
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;