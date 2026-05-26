import { Navigate } from "react-router-dom";
import { isAdmin, isAuthenticated } from "../utils/auth";

function ProtectedRoute({ children, requireAdmin = false }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/profile" replace />;
  }

  return children;
}

export default ProtectedRoute;
