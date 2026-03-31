import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { Mail, Lock, BarChart3, Package, Truck } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
    } catch {
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo">
            <div className="auth-logo-icon">⛓</div>
            <div>
              <div className="auth-logo-text">SupplyChain MS</div>
              <div className="auth-logo-sub">Management System</div>
            </div>
          </div>

          <h1 className="auth-headline">
            Command your<br />supply chain.
          </h1>
          <p className="auth-subtext">
            A unified platform to track suppliers, manage inventory,
            process orders, and monitor shipments — all in one place.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="feature-icon blue"><BarChart3 size={18}/></div>
              <div>
                <div className="feature-title">Real-time Analytics</div>
                <div className="feature-desc">KPI dashboards & live stock alerts</div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="feature-icon green"><Package size={18}/></div>
              <div>
                <div className="feature-title">Inventory Control</div>
                <div className="feature-desc">Multi-warehouse stock management</div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="feature-icon amber"><Truck size={18}/></div>
              <div>
                <div className="feature-title">Shipment Tracking</div>
                <div className="feature-desc">End-to-end logistics visibility</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Sign in to your account</h2>
            <p className="auth-card-subtitle">Enter your credentials to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field-group">
              <label className="field-label">Email address</label>
              <div className="field-input-wrap">
                <span className="field-icon"><Mail size={15}/></span>
                <input
                  className="field-input"
                  type="email"
                  placeholder="you@company.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-input-wrap">
                <span className="field-icon"><Lock size={15}/></span>
                <input
                  className="field-input"
                  type="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  Signing in
                  <span className="loading-dots">
                    <span/><span/><span/>
                  </span>
                </span>
              ) : "Sign In"}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <p className="auth-switch">
            Don't have an account?{" "}
            <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;