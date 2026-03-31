import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Mail, Lock, User, Shield, BarChart3, Package, Truck } from "lucide-react";
import api from "../api/axios";

const roles = [
  { value: "admin",           label: "Admin",     icon: "🛡️", desc: "Full access" },
  { value: "manager",         label: "Manager",   icon: "📊", desc: "Manage ops"  },
  { value: "warehouse_staff", label: "Staff",     icon: "📦", desc: "Inventory"   },
];

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "", role: "warehouse_staff"
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match"); return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters"); return;
    }
    setLoading(true);
    try {
      await api.post("/auth/register", {
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     form.role,
      });
      toast.success("Account created! Please sign in.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.detail || "Registration failed");
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
            Join the<br />network.
          </h1>
          <p className="auth-subtext">
            Create your account to get started. Choose your role to
            unlock the right tools and dashboards for your workflow.
          </p>

          <div className="auth-features">
            <div className="auth-feature">
              <div className="feature-icon blue"><Shield size={18}/></div>
              <div>
                <div className="feature-title">Role-Based Access</div>
                <div className="feature-desc">Admin, Manager & Staff permissions</div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="feature-icon green"><BarChart3 size={18}/></div>
              <div>
                <div className="feature-title">Instant Dashboards</div>
                <div className="feature-desc">Live stats from day one</div>
              </div>
            </div>
            <div className="auth-feature">
              <div className="feature-icon amber"><Package size={18}/></div>
              <div>
                <div className="feature-title">Full Traceability</div>
                <div className="feature-desc">Track every item end-to-end</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-title">Create your account</h2>
            <p className="auth-card-subtitle">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {/* Full name */}
            <div className="field-group">
              <label className="field-label">Full name</label>
              <div className="field-input-wrap">
                <span className="field-icon"><User size={15}/></span>
                <input
                  className="field-input"
                  type="text"
                  placeholder="e.g. John Doe"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="field-group">
              <label className="field-label">Password</label>
              <div className="field-input-wrap">
                <span className="field-icon"><Lock size={15}/></span>
                <input
                  className="field-input"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Confirm password */}
            <div className="field-group">
              <label className="field-label">Confirm password</label>
              <div className="field-input-wrap">
                <span className="field-icon"><Lock size={15}/></span>
                <input
                  className="field-input"
                  type="password"
                  placeholder="Re-enter your password"
                  value={form.confirm}
                  onChange={e => setForm({...form, confirm: e.target.value})}
                  required
                />
              </div>
            </div>

            {/* Role selector */}
            <div className="field-group">
              <label className="field-label">Select your role</label>
              <div className="role-cards">
                {roles.map(r => (
                  <div
                    key={r.value}
                    className={`role-card ${form.role === r.value ? "selected" : ""}`}
                    onClick={() => setForm({...form, role: r.value})}
                  >
                    <div className="role-card-icon">{r.icon}</div>
                    <div className="role-card-label">{r.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-auth" disabled={loading}>
              {loading ? (
                <span className="btn-loading">
                  Creating account
                  <span className="loading-dots">
                    <span/><span/><span/>
                  </span>
                </span>
              ) : "Create Account"}
            </button>
          </form>

          <div className="auth-divider">or</div>

          <p className="auth-switch">
            Already have an account?{" "}
            <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;