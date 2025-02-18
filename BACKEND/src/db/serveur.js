const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const authRoutes = require('../routes/authRoutes');
const initDB = require('./dbinit');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000;

initDB().then(() => {
    app.listen(PORT, () => console.log(`✅ Serveur démarré sur le port ${PORT}`));
}).catch(err => {
    console.error("❌ Erreur lors de l'initialisation de la base de données :", err);
    process.exit(1); 
});