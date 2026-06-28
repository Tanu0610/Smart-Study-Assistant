import mysql from "mysql2/promise";
import sqlite3 from "sqlite3";
import path from "path";
import fs from "fs";

let isMysql = false;
let mysqlConnection: mysql.Connection | null = null;
let sqliteDb: any = null;

// Database configurations from environment variables
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "smart_study_db",
  port: parseInt(process.env.DB_PORT || "3306", 10),
};

export async function initializeDatabase() {
  // Check if we should try connecting to MySQL
  const hasMysqlConfig = process.env.DB_HOST && process.env.DB_NAME;

  if (hasMysqlConfig) {
    try {
      console.log(`Attempting to connect to MySQL database at ${dbConfig.host}...`);
      
      // First, connect without database to create it if it doesn't exist
      const conn = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        port: dbConfig.port,
      });

      await conn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\``);
      await conn.end();

      // Now connect to the database itself
      mysqlConnection = await mysql.createConnection({
        host: dbConfig.host,
        user: dbConfig.user,
        password: dbConfig.password,
        database: dbConfig.database,
        port: dbConfig.port,
      });

      console.log("Successfully connected to MySQL database!");
      isMysql = true;

      // Create users table
      await mysqlConnection.query(`
        CREATE TABLE IF NOT EXISTS users (
          id INT AUTO_INCREMENT PRIMARY KEY,
          username VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
      return;
    } catch (err: any) {
      console.warn("MySQL connection failed. Falling back to local SQLite database. Error:", err.message);
    }
  } else {
    console.log("No MySQL environment variables found. Falling back to local SQLite database.");
  }

  // Fallback: Initialize SQLite
  const dbPath = path.join(process.cwd(), "database.sqlite");
  sqliteDb = new sqlite3.Database(dbPath);
  isMysql = false;

  sqliteDb.serialize(() => {
    sqliteDb.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `, (err: any) => {
      if (err) {
        console.error("Failed to create SQLite users table:", err.message);
      } else {
        console.log("SQLite database initialized successfully at:", dbPath);
      }
    });
  });
}

// Register user
export async function registerUser(username: string, passwordHash: string): Promise<boolean> {
  const cleanUsername = username.trim();
  if (isMysql && mysqlConnection) {
    try {
      const [rows]: any = await mysqlConnection.query(
        "SELECT id FROM users WHERE username = ?",
        [cleanUsername]
      );
      if (rows.length > 0) {
        throw new Error("Username already exists in MySQL");
      }
      await mysqlConnection.query(
        "INSERT INTO users (username, password_hash) VALUES (?, ?)",
        [cleanUsername, passwordHash]
      );
      return true;
    } catch (err: any) {
      console.error("MySQL Registration Error:", err.message);
      throw err;
    }
  } else if (sqliteDb) {
    return new Promise((resolve, reject) => {
      sqliteDb.get(
        "SELECT id FROM users WHERE username = ?",
        [cleanUsername],
        (err: any, row: any) => {
          if (err) return reject(err);
          if (row) return reject(new Error("Username already exists in SQLite"));

          sqliteDb.run(
            "INSERT INTO users (username, password_hash) VALUES (?, ?)",
            [cleanUsername, passwordHash],
            function (this: any, err2: any) {
              if (err2) return reject(err2);
              resolve(true);
            }
          );
        }
      );
    });
  }
  throw new Error("Database not initialized");
}

// Verify user login credentials
export async function verifyUser(username: string, passwordHash: string): Promise<boolean> {
  const cleanUsername = username.trim();
  if (isMysql && mysqlConnection) {
    try {
      const [rows]: any = await mysqlConnection.query(
        "SELECT password_hash FROM users WHERE username = ?",
        [cleanUsername]
      );
      if (rows.length === 0) return false;
      return rows[0].password_hash === passwordHash;
    } catch (err: any) {
      console.error("MySQL Login Verification Error:", err.message);
      return false;
    }
  } else if (sqliteDb) {
    return new Promise((resolve) => {
      sqliteDb.get(
        "SELECT password_hash FROM users WHERE username = ?",
        [cleanUsername],
        (err: any, row: any) => {
          if (err || !row) return resolve(false);
          resolve(row.password_hash === passwordHash);
        }
      );
    });
  }
  return false;
}
