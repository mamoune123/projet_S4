import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import LogoutIcon from "@mui/icons-material/Logout";

const Navbar = () => {
  const navigate = useNavigate();

  // Handle logout
  const handleLogout = () => {
    // Perform logout logic (e.g., clear user session, redirect to login)
    console.log("User logged out");
    navigate("/login");
  };

  return (
    <AppBar position="static" sx={{ backgroundColor: "#1976d2" }}>
      <Toolbar>
        {/* Logo or Brand Name */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          CollabTask
        </Typography>

        {/* Centered Navigation Links */}
        <Box
          sx={{
            display: "flex",
            gap: "20px",
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <Button
            component={Link}
            to="/"
            color="inherit"
            sx={{ textTransform: "none", fontSize: "16px" }}
          >
            Home
          </Button>
          <Button
            component={Link}
            to="/login"
            color="inherit"
            sx={{ textTransform: "none", fontSize: "16px" }}
          >
            Login
          </Button>
          <Button
            component={Link}
            to="/dashboard"
            color="inherit"
            sx={{ textTransform: "none", fontSize: "16px" }}
          >
            Dashboard
          </Button>
        </Box>

        {/* Logout Button */}
        <IconButton color="inherit" onClick={handleLogout}>
          <LogoutIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
