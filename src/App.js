import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DashboardAcheteur from "./pages/DashboardAcheteur";

const ProtectedRoute = ({ children }) => {
  return localStorage.getItem("token") ? children : <Navigate to="/" />;
};

const SmartDashboard = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (user.role === "acheteur") return <DashboardAcheteur />;
  return <Dashboard />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<ProtectedRoute><SmartDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
