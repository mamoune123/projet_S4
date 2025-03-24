import { useContext, useEffect } from "react";
import { Navigate, Outlet, useNavigate } from "react-router-dom";
import AuthContext from "../context/authContext";
import { CircularProgress, Box } from "@mui/material";

const PrivateRoute = ({ requiredRole }) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();

  // Effect to check auth status on route access
  useEffect(() => {
    // If not loading and not authenticated, redirect
    if (!loading && !isAuthenticated) {
      navigate("/login", { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  // Show loading spinner while auth status is being checked
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 5 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check role requirement if specified
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  // User is authenticated and has the required role
  return <Outlet />;
};

export default PrivateRoute;
