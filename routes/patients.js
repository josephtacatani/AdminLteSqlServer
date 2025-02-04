const express = require('express');
const bcrypt = require('bcrypt');
const { sql, poolPromise } = require('../db'); // SQL Server DB Connection
const { verifyToken, verifyRole } = require('../middlewares/auth');

const router = express.Router();

/** ✅ Get all patients */
router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT id AS user_id, fullname, address, birthday, gender AS sex, email, contact_number, photo
      FROM users WHERE role = 'patient'
    `);

    res.status(200).json({ message: 'Patients retrieved successfully.', data: result.recordset });
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Internal server error.', data: null });
  }
});

/** ✅ Get a specific patient by ID */
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid patient ID.', data: null });

  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, id).query(`
      SELECT id AS user_id, fullname, address, birthday, gender AS sex, email, contact_number, photo
      FROM users WHERE id = @id AND role = 'patient'
    `);

    if (!result.recordset.length) return res.status(404).json({ message: 'Patient not found.', data: null });

    res.status(200).json({ message: 'Patient retrieved successfully.', data: result.recordset[0] });
  } catch (error) {
    console.error(`Error fetching patient ID ${id}:`, error);
    res.status(500).json({ message: 'Internal server error.', data: null });
  }
});

/** ✅ Create a new patient */
router.post('/', verifyToken, verifyRole('admin'), async (req, res) => {
  const { fullname, address, birthday, sex, email, contact_number, password, photo } = req.body;

  if (!fullname || !email || !password) {
    return res.status(400).json({ message: 'Missing required fields.', data: null });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const pool = await poolPromise;
    const result = await pool.request()
      .input('fullname', sql.NVarChar, fullname)
      .input('address', sql.NVarChar, address)
      .input('birthday', sql.Date, birthday)
      .input('sex', sql.NVarChar, sex)
      .input('email', sql.NVarChar, email)
      .input('contact_number', sql.NVarChar, contact_number)
      .input('password', sql.NVarChar, hashedPassword)
      .input('photo', sql.NVarChar, photo)
      .query(`
        INSERT INTO users (fullname, address, birthday, gender, email, contact_number, password, photo, role)
        OUTPUT INSERTED.id
        VALUES (@fullname, @address, @birthday, @sex, @email, @contact_number, @password, @photo, 'patient')
      `);

    res.status(201).json({ message: 'Patient created successfully.', data: { id: result.recordset[0].id } });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ message: 'Internal server error.', data: null });
  }
});

/** ✅ Update patient details */
router.put('/:id', verifyToken, verifyRole('admin', 'patient'), async (req, res) => {
  const { id } = req.params;
  const { fullname, address, birthday, sex, contact_number, photo } = req.body;

  if (isNaN(id)) return res.status(400).json({ message: 'Invalid patient ID.', data: null });

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('fullname', sql.NVarChar, fullname)
      .input('address', sql.NVarChar, address)
      .input('birthday', sql.Date, birthday)
      .input('sex', sql.NVarChar, sex)
      .input('contact_number', sql.NVarChar, contact_number)
      .input('photo', sql.NVarChar, photo)
      .query(`
        UPDATE users
        SET fullname = @fullname, address = @address, birthday = @birthday, gender = @sex,
            contact_number = @contact_number, photo = @photo
        WHERE id = @id AND role = 'patient'
      `);

    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: 'Patient not found.', data: null });

    res.status(200).json({ message: 'Patient details updated successfully.', data: { id, fullname, address, birthday, sex, contact_number, photo } });
  } catch (error) {
    console.error(`Error updating patient ID ${id}:`, error);
    res.status(500).json({ message: 'Internal server error.', data: null });
  }
});

/** ✅ Delete a patient */
router.delete('/:id', verifyToken, verifyRole('admin'), async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid patient ID.', data: null });

  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, id).query(`DELETE FROM users WHERE id = @id AND role = 'patient'`);

    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: 'Patient not found.', data: null });

    res.status(200).json({ message: 'Patient deleted successfully.', data: { id } });
  } catch (error) {
    console.error(`Error deleting patient ID ${id}:`, error);
    res.status(500).json({ message: 'Internal server error.', data: null });
  }
});

/** ✅ Reset a patient's password */
router.put('/reset-password/:id', verifyToken, verifyRole('admin', 'patient'), async (req, res) => {
  const { id } = req.params;
  const { newPassword } = req.body;

  if (!newPassword) return res.status(400).json({ message: 'Missing new password.', data: null });
  if (isNaN(id)) return res.status(400).json({ message: 'Invalid patient ID.', data: null });

  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('password', sql.NVarChar, hashedPassword)
      .query(`UPDATE users SET password = @password WHERE id = @id AND role = 'patient'`);

    if (result.rowsAffected[0] === 0) return res.status(404).json({ message: 'Patient not found.', data: null });

    res.status(200).json({ message: 'Patient password reset successfully.', data: { id } });
  } catch (error) {
    console.error(`Error resetting password for patient ID ${id}:`, error);
    res.status(500).json({ message: 'Internal server error.', data: null });
  }
});

module.exports = router;