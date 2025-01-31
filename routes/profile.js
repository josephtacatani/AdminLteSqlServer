const express = require('express');
const { sql, poolPromise } = require('../db'); // ✅ Using poolPromise for SQL Server
const { verifyToken } = require('../middlewares/auth');

const router = express.Router();

/**
 * ✅ Get User Profile (Token Required)
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;

    const result = await pool.request()
      .input('userId', sql.Int, req.user.id) // ✅ Secure parameterized query
      .query(`
        SELECT id, email, fullname, role
        FROM users
        WHERE id = @userId
      `);

    if (!result.recordset.length) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.json(result.recordset[0]); // ✅ Return user profile
  } catch (error) {
    console.error("❌ Profile Fetch Error:", error);
    res.status(500).json({ message: 'Error fetching user profile.', error: error.message });
  }
});

module.exports = router;
