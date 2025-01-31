const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { sql, poolPromise } = require('../db'); // ✅ Fixed duplicate import
const sendEmail = require('../utils/email');

const router = express.Router();

// ✅ LOGIN ROUTE
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required.", data: null });
  }

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('email', sql.VarChar, email)
      .query('SELECT * FROM users WHERE email = @email');

    const user = result.recordset[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid credentials.", data: null });
    }

    if (!user.email_verified) {
      return res.status(403).json({ message: "Email not verified. Please verify your email to log in.", data: null });
    }

    const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const refreshToken = jwt.sign({ id: user.id, role: user.role }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

    await pool
      .request()
      .input('refresh_token', sql.VarChar, refreshToken)
      .input('id', sql.Int, user.id)
      .query('UPDATE users SET refresh_token = @refresh_token WHERE id = @id');

    res.status(200).json({ message: "Login successful.", data: { accessToken, refreshToken } });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "An error occurred during login.", data: null });
  }
});

// ✅ REGISTER ROUTE
router.post('/register', async (req, res) => {
  const { email, password, role, fullname, photo, birthday, address, gender, contact_number } = req.body;
  const status = 'pending';

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;

    const result = await pool
      .request()
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, hashedPassword)
      .input('role', sql.VarChar, role)
      .input('status', sql.VarChar, status)
      .input('fullname', sql.VarChar, fullname)
      .input('photo', sql.VarChar, photo)
      .input('birthday', sql.Date, birthday)
      .input('address', sql.VarChar, address)
      .input('gender', sql.VarChar, gender)
      .input('contact_number', sql.VarChar, contact_number)
      .query(
        `INSERT INTO users (email, password, role, status, fullname, photo, birthday, address, gender, contact_number, email_verified)
         OUTPUT Inserted.id
         VALUES (@email, @password, @role, @status, @fullname, @photo, @birthday, @address, @gender, @contact_number, 0)`
      );

    const userId = result.recordset[0].id;
    const verificationToken = jwt.sign({ id: userId, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
    const verificationLink = `http://localhost:${process.env.PORT || 8082}/auth/verify-email?token=${verificationToken}`;

    try {
      await sendEmail(email, "Verify your email", `<p>Click the link to verify: <a href="${verificationLink}">${verificationLink}</a></p>`);
      res.status(201).json({ message: "Registration successful. Please check your email to verify your account.", data: { id: userId, email, role, status } });
    } catch (emailError) {
      console.error("Email Error:", emailError);
      res.status(500).json({ message: "Registration successful, but failed to send verification email.", data: null });
    }
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ message: "An unexpected error occurred.", data: null });
  }
});

// ✅ REFRESH TOKEN ROUTE
router.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Refresh token is required.", data: null });

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid or expired refresh token.", data: null });

    const newAccessToken = jwt.sign({ id: decoded.id, role: decoded.role }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    res.status(200).json({ message: "Access token refreshed successfully.", data: { accessToken: newAccessToken } });
  });
});

// ✅ LOGOUT ROUTE
router.post('/logout', async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(400).json({ message: "Refresh token is required.", data: null });

  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('refresh_token', sql.VarChar, refreshToken)
      .query('UPDATE users SET refresh_token = NULL WHERE refresh_token = @refresh_token');

    if (result.rowsAffected[0] === 0) {
      return res.status(401).json({ message: "Invalid refresh token.", data: null });
    }

    res.status(200).json({ message: "Logout successful.", data: null });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Database query failed.", data: null });
  }
});

// ✅ VERIFY EMAIL ROUTE
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "Token is required.", data: null });

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const pool = await poolPromise;

    await pool
      .request()
      .input('id', sql.Int, decoded.id)
      .query('UPDATE users SET email_verified = 1, status = "active" WHERE id = @id');

    res.status(200).json({ message: "Email verified successfully. Your account is now active.", data: null });
  } catch (error) {
    console.error("Email Verification Error:", error);
    res.status(400).json({ message: "Invalid or expired token.", data: null });
  }
});

module.exports = router;
