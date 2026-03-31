import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import { useAuth } from "./context/AuthContext";

import Login     from "./pages/Login";
import Register  from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Suppliers from "./pages/Suppliers";
import Inventory from "./pages/Inventory";
import Orders    from "./pages/Orders";
import Shipments from "./pages/Shipments";

const Layout = ({ children }) => {
  const { user } = useAuth();
  if (!user) return children;
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
};

const AppRoutes = () => (
  <Layout>
    <Routes>
      <Route path="/login"    element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/"         element={<Navigate to="/dashboard" replace />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><Dashboard /></ProtectedRoute>
      }/>
      <Route path="/suppliers" element={
        <ProtectedRoute allowedRoles={["admin","manager"]}>
          <Suppliers />
        </ProtectedRoute>
      }/>
      <Route path="/inventory" element={
        <ProtectedRoute allowedRoles={["admin","manager","warehouse_staff"]}>
          <Inventory />
        </ProtectedRoute>
      }/>
      <Route path="/orders" element={
        <ProtectedRoute allowedRoles={["admin","manager","warehouse_staff"]}>
          <Orders />
        </ProtectedRoute>
      }/>
      <Route path="/shipments" element={
        <ProtectedRoute allowedRoles={["admin","manager"]}>
          <Shipments />
        </ProtectedRoute>
      }/>
    </Routes>
  </Layout>
);

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="dark"
        toastStyle={{ background: "#0f1623", border: "1px solid #1f2d45", color: "#e8edf5" }}
      />
    </AuthProvider>
  </BrowserRouter>
);

export default App;