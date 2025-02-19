const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

const testConnection = async () => {
  try {
    const client = await pool.connect(); // Try to connect to the database
    console.log("Database connection successful!");
    client.release(); // Release the client back to the pool
  } catch (err) {
    console.error("Error connecting to the database:", err);
  }
};

testConnection();

module.exports = pool;
