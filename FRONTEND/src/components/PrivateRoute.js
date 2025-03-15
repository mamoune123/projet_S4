import { useContext } from "react";
import { Navigate } from "react-router-dom";
import AuthContext from "../context/authContext";

const PrivateRoute = ({ children, roleRequired }) => {
  const { user, role, loading } = useContext(AuthContext);
  const hasToken = !!localStorage.getItem("accessToken");

  if (loading) return null; // Prevents flickering

  // Check both user state and token presence
  if (!user || !hasToken) return <Navigate to="/login" replace />;
  if (roleRequired && role !== roleRequired)
    return <Navigate to="/unauthorized" replace />;

  return children;
};

export default PrivateRoute;
