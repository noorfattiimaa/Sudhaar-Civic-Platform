import { Navigate, Outlet } from "react-router-dom";
import { authService } from "../../services/auth";

interface ProtectedRouteProps {
  allowedRole?: string;
  children?: React.ReactNode;
}

export default function ProtectedRoute({ allowedRole, children }: ProtectedRouteProps) {
  // 1. Check if user has valid JWT token
  const isAuthenticated = authService.isAuthenticated();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 2. Get the user data from localStorage to check their role
  const userStr = localStorage.getItem("sudhaar_user");
  const user = userStr ? JSON.parse(userStr) : null;

  // 3. If we are authenticated but have no user data, something is wrong, go to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 4. If a specific role is required, check if user has that role
  if (allowedRole && user.role !== allowedRole) {
    // Redirect to their appropriate dashboard
    return <Navigate to="/dashboard" replace />;
  }

  // If children are provided, render them; otherwise render Outlet
  return children ? <>{children}</> : <Outlet />;
}