import { useEffect, useState } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  Package, Users, ShoppingCart, Truck,
  AlertTriangle, DollarSign, TrendingUp, Activity,IndianRupee
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  RadialBarChart, RadialBar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ── Palette ────────────────────────────────────────────────
const COLORS = {
  blue:   "#3b82f6",
  teal:   "#14b8a6",
  violet: "#8b5cf6",
  amber:  "#f59e0b",
  rose:   "#f43f5e",
  green:  "#10b981",
  sky:    "#0ea5e9",
  orange: "#f97316",
};
const PIE_COLORS  = [COLORS.blue, COLORS.teal, COLORS.green, COLORS.amber, COLORS.rose, COLORS.violet];
const STATUS_COLOR = {
  pending:"#f59e0b", confirmed:"#3b82f6", packed:"#8b5cf6",
  dispatched:"#14b8a6", delivered:"#10b981", cancelled:"#f43f5e",
  in_transit:"#0ea5e9", out_for_delivery:"#f97316", returned:"#f43f5e",
};

// ── Tooltip styles ─────────────────────────────────────────
const TooltipStyle = {
  contentStyle: { background:"#0f1623", border:"1px solid #1f2d45", borderRadius:10, fontSize:12, color:"#e8edf5" },
  cursor:       { fill:"rgba(59,130,246,0.06)" },
};

// ── Stat card ──────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, color, sub, delay }) => (
  <div className="stat-card" style={{ animationDelay: delay }}>
    <div className="stat-icon" style={{ background: color + "22", border: `1px solid ${color}33` }}>
      <Icon size={19} color={color} />
    </div>
    <div style={{ flex:1 }}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value ?? "—"}</p>
      {sub && <p style={{ fontSize:"0.7rem", color:"var(--text-muted)", marginTop:"0.1rem" }}>{sub}</p>}
    </div>
  </div>
);

// ── Chart card wrapper ─────────────────────────────────────
const ChartCard = ({ title, subtitle, children, span = 1 }) => (
  <div className={`chart-card ${span === 2 ? "chart-card--wide" : ""}`}>
    <div className="chart-card-header">
      <div>
        <p className="chart-title">{title}</p>
        {subtitle && <p className="chart-subtitle">{subtitle}</p>}
      </div>
    </div>
    {children}
  </div>
);

// ── Custom pie label ───────────────────────────────────────
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r  = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x  = cx + r * Math.cos(-midAngle * RADIAN);
  const y  = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#e8edf5" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={500}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ── Recent orders mini-table ───────────────────────────────
const RecentOrders = ({ orders }) => (
  <div className="recent-table">
    <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.8rem" }}>
      <thead>
        <tr>
          {["Customer","Total","Status","Date"].map(h => (
            <th key={h} style={{ padding:"0.5rem 0.75rem", textAlign:"left", color:"var(--text-muted)",
              fontWeight:600, fontSize:"0.7rem", textTransform:"uppercase", letterSpacing:"0.06em",
              borderBottom:"1px solid var(--border)" }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {orders.length === 0 && (
          <tr><td colSpan={4} style={{ textAlign:"center", padding:"2rem", color:"var(--text-muted)" }}>
            No orders yet
          </td></tr>
        )}
        {orders.map(o => (
          <tr key={o.id} style={{ transition:"background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <td style={{ padding:"0.6rem 0.75rem", color:"var(--text-primary)", fontWeight:500 }}>
              {o.customer_name}
            </td>
            <td style={{ padding:"0.6rem 0.75rem", color:COLORS.green }}>
              ${o.total_amount?.toFixed(2)}
            </td>
            <td style={{ padding:"0.6rem 0.75rem" }}>
              <span style={{
                padding:"0.2rem 0.55rem", borderRadius:20, fontSize:"0.7rem", fontWeight:600,
                background: (STATUS_COLOR[o.status] || "#888") + "22",
                color: STATUS_COLOR[o.status] || "#888",
                border: `1px solid ${(STATUS_COLOR[o.status] || "#888")}44`
              }}>{o.status}</span>
            </td>
            <td style={{ padding:"0.6rem 0.75rem", color:"var(--text-muted)", fontSize:"0.75rem" }}>
              {o.created_at ? new Date(o.created_at).toLocaleDateString() : "—"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

// ── Main dashboard ─────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuth();
  const [stats,   setStats]   = useState(null);
  const [charts,  setCharts]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [sup, inv, ord, ship, lowStock, invStats, ordStats, shipStats] =
          await Promise.all([
            api.get("/suppliers/?limit=100"),
            api.get("/inventory/?limit=100"),
            api.get("/orders/?limit=100"),
            api.get("/shipments/?limit=100"),
            api.get("/inventory/low-stock"),
            api.get("/inventory/stats"),
            api.get("/orders/stats"),
            api.get("/shipments/stats"),
          ]);

        setStats({
          suppliers: sup.data.meta?.count  ?? sup.data.data?.length  ?? 0,
          inventory: inv.data.meta?.count  ?? inv.data.data?.length  ?? 0,
          orders:    ord.data.meta?.count  ?? ord.data.data?.length  ?? 0,
          shipments: ship.data.meta?.count ?? ship.data.data?.length ?? 0,
          lowStock:  lowStock.data.length  ?? 0,
          revenue:   ordStats.data.total_revenue ?? 0,
        });

        setCharts({
          ordersByStatus:    ordStats.data.by_status    ?? [],
          recentOrders:      ordStats.data.recent_orders ?? [],
          shipmentsByStatus: shipStats.data.by_status   ?? [],
          shipmentsByCarrier:shipStats.data.by_carrier  ?? [],
          warehouseStock:    invStats.data.warehouses   ?? [],
          topProducts:       invStats.data.top_products ?? [],
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const roleIcons = { admin:"🛡️", manager:"📊", warehouse_staff:"📦" };

  // Build area-chart data from ordersByStatus (mock trend if no time data)
  const orderTrendData = (charts?.ordersByStatus ?? []).map((s, i) => ({
    name:    s.status,
    orders:  s.count,
    revenue: s.revenue,
  }));

  const shipmentPieData = (charts?.shipmentsByStatus ?? []).map(s => ({
    name:  s.status.replace(/_/g, " "),
    value: s.count,
  }));

  const carrierData = (charts?.shipmentsByCarrier ?? []).map(c => ({
    name:  c.carrier,
    value: c.count,
  }));

  const warehouseData = (charts?.warehouseStock ?? []).map(w => ({
    name:  w.name.length > 14 ? w.name.slice(0, 14) + "…" : w.name,
    stock: w.qty,
    items: w.items,
  }));

  const topProductData = (charts?.topProducts ?? []).map(p => ({
    name: p.product_name.length > 12 ? p.product_name.slice(0, 12) + "…" : p.product_name,
    qty:  p.quantity,
  }));

  // Radial bar data for supplier/order/shipment completion
  const radialData = stats ? [
    { name:"Orders",    value: Math.min(stats.orders    * 4, 100), fill: COLORS.blue   },
    { name:"Shipments", value: Math.min(stats.shipments * 5, 100), fill: COLORS.teal   },
    { name:"Suppliers", value: Math.min(stats.suppliers * 8, 100), fill: COLORS.violet },
  ] : [];

  if (loading) return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", height:"60vh", flexDirection:"column", gap:"1rem" }}>
      <div className="loading-spinner"/>
      <span style={{ color:"var(--text-muted)", fontSize:"0.875rem" }}>Loading dashboard...</span>
    </div>
  );

  return (
    <div className="page">

      {/* Welcome banner */}
      <div className="welcome-banner">
        <div>
          <div className="welcome-title">Good day, {user?.name?.split(" ")[0]} 👋</div>
          <div className="welcome-sub">Here's your supply chain overview for today.</div>
        </div>
        <div className="welcome-role-badge">
          <span>{roleIcons[user?.role]}</span>
          {user?.role?.replace(/_/g, " ")}
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <StatCard delay="0.05s" icon={Users}         label="Suppliers"       value={stats?.suppliers} color={COLORS.violet} sub="Active vendors" />
        <StatCard delay="0.1s"  icon={Package}       label="Inventory Items" value={stats?.inventory} color={COLORS.sky}    sub="Across all warehouses" />
        <StatCard delay="0.15s" icon={ShoppingCart}  label="Total Orders"    value={stats?.orders}    color={COLORS.green}  sub="All time" />
        <StatCard delay="0.2s"  icon={Truck}         label="Shipments"       value={stats?.shipments} color={COLORS.amber}  sub="All carriers" />
        <StatCard delay="0.25s" icon={AlertTriangle} label="Low Stock"       value={stats?.lowStock}  color={COLORS.rose}   sub="Items below threshold" />
        <StatCard delay="0.3s"  icon={IndianRupee}    label="Total Revenue"   value={`${(stats?.revenue ?? 0).toLocaleString()}`} color={COLORS.teal} sub="From all orders" />
      </div>

      {/* Charts grid */}
      <div className="charts-grid">

        {/* Orders by status — Bar chart */}
        <ChartCard title="Orders by Status" subtitle="Count and revenue per status" span={2}>
          {orderTrendData.length === 0
            ? <div className="chart-empty">No order data yet</div>
            : <ResponsiveContainer width="100%" height={240}>
                <BarChart data={orderTrendData} margin={{ top:10, right:10, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" vertical={false}/>
                  <XAxis dataKey="name" tick={{ fill:"#8ba0bc", fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:"#8ba0bc", fontSize:11 }} axisLine={false} tickLine={false}/>
                  <Tooltip {...TooltipStyle}/>
                  <Bar dataKey="orders" radius={[6,6,0,0]} maxBarSize={48}>
                    {orderTrendData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          }
        </ChartCard>

        {/* Shipment status — Pie chart */}
        <ChartCard title="Shipment Status" subtitle="Distribution across all shipments">
          {shipmentPieData.length === 0
            ? <div className="chart-empty">No shipment data yet</div>
            : <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={shipmentPieData} cx="50%" cy="50%"
                    innerRadius={55} outerRadius={90}
                    paddingAngle={3} dataKey="value"
                    labelLine={false} label={PieLabel}>
                    {shipmentPieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none"/>
                    ))}
                  </Pie>
                  <Tooltip {...TooltipStyle}/>
                  <Legend iconType="circle" iconSize={8}
                    formatter={v => <span style={{ color:"#8ba0bc", fontSize:11 }}>{v}</span>}/>
                </PieChart>
              </ResponsiveContainer>
          }
        </ChartCard>

        {/* Warehouse stock — Area chart */}
        <ChartCard title="Warehouse Stock Levels" subtitle="Total quantity per location" span={2}>
          {warehouseData.length === 0
            ? <div className="chart-empty">No warehouse data yet</div>
            : <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={warehouseData} margin={{ top:10, right:10, left:0, bottom:0 }}>
                  <defs>
                    <linearGradient id="stockGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={COLORS.blue} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={COLORS.blue} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" vertical={false}/>
                  <XAxis dataKey="name" tick={{ fill:"#8ba0bc", fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:"#8ba0bc", fontSize:11 }} axisLine={false} tickLine={false}/>
                  <Tooltip {...TooltipStyle}/>
                  <Area type="monotone" dataKey="stock" stroke={COLORS.blue}
                    strokeWidth={2} fill="url(#stockGrad)"/>
                </AreaChart>
              </ResponsiveContainer>
          }
        </ChartCard>

        {/* Top products — Horizontal bar */}
        <ChartCard title="Top Products by Quantity" subtitle="Highest stocked items">
          {topProductData.length === 0
            ? <div className="chart-empty">No inventory data yet</div>
            : <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topProductData} layout="vertical"
                  margin={{ top:5, right:20, left:10, bottom:5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" horizontal={false}/>
                  <XAxis type="number" tick={{ fill:"#8ba0bc", fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis type="category" dataKey="name" tick={{ fill:"#8ba0bc", fontSize:11 }} axisLine={false} tickLine={false} width={90}/>
                  <Tooltip {...TooltipStyle}/>
                  <Bar dataKey="qty" radius={[0,6,6,0]} maxBarSize={20}>
                    {topProductData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          }
        </ChartCard>

        {/* Carrier breakdown — Pie */}
        <ChartCard title="Shipments by Carrier" subtitle="Volume per logistics partner">
          {carrierData.length === 0
            ? <div className="chart-empty">No carrier data yet</div>
            : <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={carrierData} cx="50%" cy="50%"
                    outerRadius={90} paddingAngle={3}
                    dataKey="value" labelLine={false} label={PieLabel}>
                    {carrierData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="none"/>
                    ))}
                  </Pie>
                  <Tooltip {...TooltipStyle}/>
                  <Legend iconType="circle" iconSize={8}
                    formatter={v => <span style={{ color:"#8ba0bc", fontSize:11 }}>{v}</span>}/>
                </PieChart>
              </ResponsiveContainer>
          }
        </ChartCard>

        {/* Activity radial */}
        <ChartCard title="Platform Activity" subtitle="Relative scale of operations">
          {radialData.length === 0
            ? <div className="chart-empty">No data yet</div>
            : <ResponsiveContainer width="100%" height={240}>
                <RadialBarChart cx="50%" cy="50%"
                  innerRadius={30} outerRadius={100}
                  barSize={14} data={radialData}
                  startAngle={90} endAngle={-270}>
                  <RadialBar minAngle={5} background={{ fill:"#1f2d45" }}
                    clockWise dataKey="value" cornerRadius={6}>
                    {radialData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill}/>
                    ))}
                  </RadialBar>
                  <Legend iconType="circle" iconSize={8}
                    formatter={v => <span style={{ color:"#8ba0bc", fontSize:11 }}>{v}</span>}/>
                  <Tooltip {...TooltipStyle}/>
                </RadialBarChart>
              </ResponsiveContainer>
          }
        </ChartCard>

        {/* Revenue by order status */}
        <ChartCard title="Revenue by Order Status" subtitle="Total $ per fulfillment stage" span={2}>
          {orderTrendData.length === 0
            ? <div className="chart-empty">No revenue data yet</div>
            : <ResponsiveContainer width="100%" height={220}>
                <BarChart data={orderTrendData} margin={{ top:10, right:10, left:0, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2d45" vertical={false}/>
                  <XAxis dataKey="name" tick={{ fill:"#8ba0bc", fontSize:11 }} axisLine={false} tickLine={false}/>
                  <YAxis tick={{ fill:"#8ba0bc", fontSize:11 }} axisLine={false} tickLine={false}
                    tickFormatter={v => `$${v.toLocaleString()}`}/>
                  <Tooltip {...TooltipStyle} formatter={v => [`$${v.toLocaleString()}`, "Revenue"]}/>
                  <Bar dataKey="revenue" radius={[6,6,0,0]} maxBarSize={48} fill={COLORS.teal}>
                    {orderTrendData.map((_, i) => (
                      <Cell key={i} fill={[COLORS.teal, COLORS.sky, COLORS.violet, COLORS.green, COLORS.amber, COLORS.rose][i % 6]}/>
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
          }
        </ChartCard>

        {/* Recent orders table */}
        <ChartCard title="Recent Orders" subtitle="Last 7 orders placed" span={2}>
          <RecentOrders orders={charts?.recentOrders ?? []}/>
        </ChartCard>

      </div>
    </div>
  );
};

export default Dashboard;