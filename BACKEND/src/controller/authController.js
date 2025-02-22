const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db/db');
require('dotenv').config();


const generateTokens = (user) => {
    const accessToken = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '10m' } 
    );


    const refreshToken = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: '1h' } 
    );

    return { accessToken, refreshToken };
};

exports.refreshToken = async (req, res) => {
    const { refreshToken } = req.body;

    if (!refreshToken) return res.status(401).json({ message: "Token requis" });

    try {
        // Vérifie si le refresh token est stocké en base
        const result = await pool.query("SELECT * FROM users WHERE refresh_token = $1", [refreshToken]);
        if (result.rows.length === 0) return res.status(403).json({ message: "Refresh token invalide" });

        const user = result.rows[0];

        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
            if (err) return res.status(403).json({ message: "Token expiré ou invalide" });

            const newTokens = generateTokens(user);

            // Met à jour le refresh token en base
            pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [newTokens.refreshToken, user.id]);

            res.json(newTokens);
        });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) return res.status(401).json({ message: "Utilisateur non trouvé" });

        const user = result.rows[0];
        const user_id = user.id;
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

        const { accessToken, refreshToken } = generateTokens(user);

        // Stocke le refresh token en base
        await pool.query("UPDATE users SET refresh_token = $1 WHERE id = $2", [refreshToken, user.id]);

        res.json({ accessToken, refreshToken, user_id });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};



exports.register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const userExists = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
        if (userExists.rows.length > 0) {
            return res.status(400).json({ message: "Cet utilisateur existe déjà" });
        }

        // Hachage du mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insertion dans la DB
        const newUser = await pool.query(
            "INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *",
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: "Utilisateur enregistré avec succès", user: newUser.rows[0] });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


exports.logout = async (req, res) => {
    const { userId } = req.body;
    try {
        await pool.query("UPDATE users SET refresh_token = NULL WHERE id = $1", [userId]);
        res.json({ message: "Déconnecté avec succès" });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

// Récupérer les infos de l'utilisateur connecté
exports.getUser = async (req, res) => {
    try {
        const user = await pool.query("SELECT id, username, email, role FROM users WHERE id = $1", [req.user.id]);
        res.json(user.rows[0]);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
