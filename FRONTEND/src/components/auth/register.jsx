import React, { useState, useContext } from "react";
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Paper,
  Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import AuthContext from "../../context/authContext";

const Register = () => {
  const { handleLogin } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const regex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return regex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validation des champs
    if (!username || !email || !password) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    if (!validateEmail(email)) {
      setError("L'adresse email est invalide.");
      return;
    }

    try {
      const res = await axios.post("http://localhost:5001/auth/register", {
        username,
        email,
        password,
      });

      if (res.data.user) {
        setSuccessMessage(
          "Inscription réussie. Vous êtes maintenant connecté."
        );
        // Attendre 2 secondes avant la redirection pour permettre à l'utilisateur de voir le message de succès
        setTimeout(async () => {
          await handleLogin(email, password); // Connexion après inscription
          navigate("/dashboard");
        }, 2000);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Erreur d'inscription.");
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Paper elevation={3} sx={{ padding: 3, mt: 5 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <LockOutlinedIcon color="primary" sx={{ fontSize: 40 }} />
          <Typography component="h1" variant="h5">
            Inscription
          </Typography>

          {error && <Alert severity="error">{error}</Alert>}
          {successMessage && <Alert severity="success">{successMessage}</Alert>}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 1 }}
          >
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Nom d'utilisateur"
              name="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adresse Email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Mot de passe"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              S'inscrire
            </Button>
            <Typography variant="body2" align="center">
              Déjà un compte ?{" "}
              <Link
                to="/login"
                style={{ textDecoration: "none", color: "#1976d2" }}
              >
                Se connecter
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
