import React, { useContext } from "react";
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
import AuthContext from "../../context/authContext"; // Importez votre contexte d'authentification

const Navbar = () => {
  const navigate = useNavigate();
  const { user, handleLogout } = useContext(AuthContext); // Récupérez l'utilisateur et la fonction de déconnexion

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

        {/* User Name and Logout Button */}
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {user && (
            <Typography variant="body1" sx={{ color: "white" }}>
              {user.username} {/* Affichez le nom de l'utilisateur */}
            </Typography>
          )}
          <IconButton color="inherit" onClick={handleLogout}>
            <LogoutIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
