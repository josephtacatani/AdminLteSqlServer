const express = require('express');
const bcrypt = require('bcrypt');
const { sql, poolPromise } = require('../db'); // ✅ Proper imports
const { verifyToken, verifyRole } = require('../middlewares/auth');

const router = express.Router();


/**
 * ✅ Register a new dentist (Admin only)
 */
router.post('/register', verifyToken, verifyRole('admin'), async (req, res) => {
  const { email, password, fullname, photo, birthday, address, gender, contact_number, degree, specialty } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;

    // **Check if email already exists**
    const checkEmail = await pool.request()
      .input('email', sql.VarChar, email)
      .query(`SELECT id FROM users WHERE email = @email`);

    if (checkEmail.recordset.length > 0) {
      return res.status(400).json({ message: "Email already exists. Please use a different email." });
    }

    // **Insert into users table**
    const userResult = await pool.request()
      .input('email', sql.VarChar, email)
      .input('password', sql.VarChar, hashedPassword)
      .input('role', sql.VarChar, 'dentist')
      .input('status', sql.VarChar, 'active')
      .input('fullname', sql.VarChar, fullname)
      .input('photo', sql.VarChar, photo)
      .input('birthday', sql.Date, birthday)
      .input('address', sql.Text, address)
      .input('gender', sql.VarChar, gender)
      .input('contact_number', sql.VarChar, contact_number)
      .input('email_verified', sql.Bit, 1)
      .query(`
        INSERT INTO users (email, password, role, status, fullname, photo, birthday, address, gender, contact_number, email_verified)
        OUTPUT Inserted.id
        VALUES (@email, @password, @role, @status, @fullname, @photo, @birthday, @address, @gender, @contact_number, @email_verified)
      `);

    const userId = userResult.recordset[0].id;

    // **Insert into dentists table**
    await pool.request()
      .input('user_id', sql.Int, userId)  // ✅ Using correct user_id instead of id
      .input('degree', sql.VarChar, degree)
      .input('specialty', sql.VarChar, specialty)
      .query(`INSERT INTO dentists (user_id, degree, specialty) VALUES (@user_id, @degree, @specialty)`);

    res.status(201).json({ 
      message: "Dentist registered successfully.", 
      data: { id: userId, email, fullname, degree, specialty, status: 'active' } 
    });

  } catch (error) {
    console.error("Dentist Registration Error:", error);
    res.status(500).json({ message: "An error occurred during registration.", error: error.message });
  }
});


/**
 * ✅ Get all dentists
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT u.id AS user_id, u.email, u.fullname, u.status, u.photo, u.birthday, u.address, u.gender, u.contact_number, d.degree, d.specialty
      FROM users u
      JOIN dentists d ON u.id = d.user_id
      WHERE u.role = 'dentist'`);

    res.status(200).json({ message: "Dentists retrieved successfully.", data: result.recordset });
  } catch (error) {
    console.error("Error fetching dentists:", error);
    res.status(500).json({ message: "Error fetching dentists.", error: error.message });
  }
});

/**
 * ✅ Get a specific dentist by ID
 */
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ message: "Invalid dentist ID." });

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT u.id AS user_id, u.email, u.fullname, u.status, u.photo, u.birthday, u.address, u.gender, u.contact_number, d.degree, d.specialty
        FROM users u
        JOIN dentists d ON u.id = d.user_id
        WHERE u.id = @id AND u.role = 'dentist'`);

    if (!result.recordset.length) return res.status(404).json({ message: "Dentist not found." });

    res.status(200).json({ message: "Dentist retrieved successfully.", data: result.recordset[0] });
  } catch (error) {
    console.error("Error fetching dentist:", error);
    res.status(500).json({ message: "Error fetching dentist.", error: error.message });
  }
});

/**
 * ✅ Update a dentist's details
 */
router.put('/:id', verifyToken, verifyRole('admin', 'dentist'), async (req, res) => {
  const { id } = req.params;
  const { fullname, photo, birthday, address, gender, contact_number, degree, specialty } = req.body;
  if (isNaN(id)) return res.status(400).json({ message: "Invalid dentist ID." });

  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('fullname', sql.VarChar, fullname)
      .input('photo', sql.VarChar, photo)
      .input('birthday', sql.Date, birthday)
      .input('address', sql.Text, address)
      .input('gender', sql.VarChar, gender)
      .input('contact_number', sql.VarChar, contact_number)
      .query(`
        UPDATE users 
        SET fullname = @fullname, photo = @photo, birthday = @birthday, address = @address, gender = @gender, contact_number = @contact_number
        WHERE id = @id
      `);

    await pool.request()
      .input('id', sql.Int, id)
      .input('degree', sql.VarChar, degree)
      .input('specialty', sql.VarChar, specialty)
      .query(`UPDATE dentists SET degree = @degree, specialty = @specialty WHERE user_id = @id`);

    res.status(200).json({ message: "Dentist details updated successfully." });
  } catch (error) {
    console.error("Error updating dentist:", error);
    res.status(500).json({ message: "Error updating dentist details.", error: error.message });
  }
});

/**
 * ✅ Delete a dentist (Admin only)
 */
router.delete('/:id', verifyToken, verifyRole('admin'), async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ message: "Invalid dentist ID." });

  try {
    const pool = await poolPromise;
    await pool.request().input('id', sql.Int, id).query(`DELETE FROM dentists WHERE user_id = @id`);
    await pool.request().input('id', sql.Int, id).query(`DELETE FROM users WHERE id = @id`);

    res.status(200).json({ message: "Dentist deleted successfully." });
  } catch (error) {
    console.error("Error deleting dentist:", error);
    res.status(500).json({ message: "Error deleting dentist.", error: error.message });
  }
});

module.exports = router;
