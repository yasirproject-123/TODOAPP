import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,

  ssl: {
    rejectUnauthorized: false,
  },

  dateStrings: true,
});

db.query("SELECT 1")
  .then(() => {
    console.log("✅ MySQL connected successfully");
  })
  .catch((error) => {
    console.error("❌ MySQL connection failed:", error.message);
  });

export default db;