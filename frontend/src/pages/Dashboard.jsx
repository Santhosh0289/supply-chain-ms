import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Package, Users, ShoppingCart, Truck, AlertTriangle } from "lucide-react";

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
  <div className="stat-card" style={{ animationDelay: delay }}>
    <div className="stat-icon" style={{ background: color }}>
      <Icon size={20} color="#fff" />
    </div>
    <div>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value ?? "—"}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [sup, inv, ord, ship, low] = await Promise.all([
          api.get("/suppliers/"),
          api.get("/inventory/"),
          api.get("/orders/"),
          api.get("/shipments/"),
          api.get("/inventory/low-stock"),
        ]);
        setStats({
          suppliers: sup.data.length,
          inventory: inv.data.length,
          orders:    ord.data.length,
          shipments: ship.data.length,
          lowStock:  low.data.length,
        });
      } catch (err) { console.error(err); }
    };
    fetchStats();
  }, []);

  const roleIcons = { admin: "🛡️", manager: "📊", warehouse_staff: "📦" };

  return (
    <div className="page">
      <div className="welcome-banner">
        <div>
          <div className="welcome-title">
            Good day, {user?.name?.split(" ")[0]} 👋
          </div>
          <div className="welcome-sub">
            Here's an overview of your supply chain operations.
          </div>
        </div>
        <div className="welcome-role-badge">
          <span>{roleIcons[user?.role]}</span>
          {user?.role?.replace(/_/g, " ")}
        </div>
      </div>

      <div className="stats-grid">
        <StatCard delay="0.05s" icon={Users}         label="Total Suppliers"  value={stats?.suppliers} color="rgba(99,102,241,0.8)"  />
        <StatCard delay="0.1s"  icon={Package}       label="Inventory Items"  value={stats?.inventory} color="rgba(14,165,233,0.8)"  />
        <StatCard delay="0.15s" icon={ShoppingCart}  label="Total Orders"     value={stats?.orders}    color="rgba(16,185,129,0.8)"  />
        <StatCard delay="0.2s"  icon={Truck}         label="Shipments"        value={stats?.shipments} color="rgba(245,158,11,0.8)"  />
        <StatCard delay="0.25s" icon={AlertTriangle} label="Low Stock Alerts" value={stats?.lowStock}  color="rgba(239,68,68,0.8)"   />
      </div>
    </div>
  );
};

export default Dashboard;