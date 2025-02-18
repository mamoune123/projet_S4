const jwt = require('jsonwebtoken');
require('dotenv').config();

module.exports = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(403).json({ message: "Accès refusé" });
    }

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (error) {
        res.status(401).json({ message: "Token invalide" });
    }
};
