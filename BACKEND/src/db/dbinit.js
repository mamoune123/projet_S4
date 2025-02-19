const fs = require("fs");
const path = require("path");
const pool = require("./db");
const bcrypt = require("bcryptjs");

async function initDB() {
  try {
    const sql = fs.readFileSync(path.join(__dirname, "init.sql"), "utf8");
    await pool.query(sql);
    console.log("Base de données initialisée avec succès !");
    await createAdminUser();
  } catch (error) {
    console.error(
      "Erreur lors de l'initialisation de la base de données 1 :",
      error.message
    );
  }
}

async function createAdminUser() {
  try {
    const existingAdmin = await pool.query(
      "SELECT * FROM users WHERE role = 'admin' LIMIT 1"
    );

    if (existingAdmin.rows.length > 0) {
      console.log("Un compte admin existe déjà.");
      return;
    }

    const hashedPassword = await bcrypt.hash("admin", 10); // Hash du mot de passe

    await pool.query(
      "INSERT INTO users (username, email, password, role) VALUES ($1, $2, $3, $4)",
      ["admin", "admin@admin.com", hashedPassword, "admin"]
    );

    console.log("Compte admin créé avec succès !");
  } catch (error) {
    console.error(
      "Erreur lors de la création du compte admin :",
      error.message
    );
  }
}

module.exports = initDB;
