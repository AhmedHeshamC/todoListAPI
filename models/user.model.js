const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class User {
  // Find user by ID
  static async findById(id) {
    try {
      const [rows] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [id]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Find user by email
  static async findByEmail(email) {
    try {
      const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
      return rows.length ? rows[0] : null;
    } catch (error) {
      throw error;
    }
  }
  
  // Create new user
  static async create(userData) {
    try {
      const { name, email, password } = userData;
      
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      // Insert user
      const [result] = await pool.query(
        'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
        [name, email, hashedPassword]
      );
      
      // Get created user
      const [rows] = await pool.query('SELECT id, name, email, created_at FROM users WHERE id = ?', [result.insertId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
  
  // Compare password
  static async matchPassword(enteredPassword, hashedPassword) {
    return await bcrypt.compare(enteredPassword, hashedPassword);
  }
  
  // Generate JWT token
  static getSignedToken(userId) {
    return jwt.sign(
      { id: userId }, 
      process.env.JWT_SECRET, 
      { expiresIn: process.env.JWT_EXPIRE }
    );
  }
}

module.exports = User;
