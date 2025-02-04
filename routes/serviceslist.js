const express = require('express');
const { sql, poolPromise } = require('../db'); // SQL Server DB Connection
const { verifyToken, verifyRole } = require('../middlewares/auth');

const router = express.Router();

/** ✅ Get all services */
router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM serviceslist');

    res.status(200).json({
      message: result.recordset.length ? 'Services retrieved successfully.' : 'No services found.',
      data: result.recordset,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching services.', error: error.message });
  }
});

/** ✅ Get a specific service by ID */
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) return res.status(400).json({ message: 'Invalid service ID.' });

  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, id).query('SELECT * FROM serviceslist WHERE id = @id');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    res.status(200).json({ message: 'Service retrieved successfully.', data: result.recordset[0] });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching service.', error: error.message });
  }
});

/** ✅ Create a new service */
router.post('/', verifyToken, verifyRole('admin'), async (req, res) => {
  const { service_name, title, content, photo } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('service_name', sql.NVarChar, service_name)
      .input('title', sql.NVarChar, title)
      .input('content', sql.NVarChar, content)
      .input('photo', sql.NVarChar, photo)
      .query(`
        INSERT INTO serviceslist (service_name, title, content, photo)
        OUTPUT INSERTED.id
        VALUES (@service_name, @title, @content, @photo)
      `);

    res.status(201).json({
      message: 'Service created successfully.',
      data: {
        id: result.recordset[0].id,
        service_name,
        title,
        content,
        photo,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating service.', error: error.message });
  }
});

/** ✅ Update a service */
router.put('/:id', verifyToken, verifyRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { service_name, title, content, photo } = req.body;

  if (isNaN(id)) return res.status(400).json({ message: 'Invalid service ID.' });

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('service_name', sql.NVarChar, service_name)
      .input('title', sql.NVarChar, title)
      .input('content', sql.NVarChar, content)
      .input('photo', sql.NVarChar, photo)
      .query(`
        UPDATE serviceslist
        SET service_name = @service_name, title = @title, content = @content, photo = @photo
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    res.status(200).json({ message: 'Service updated successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating service.', error: error.message });
  }
});

/** ✅ Delete a service */
router.delete('/:id', verifyToken, verifyRole('admin'), async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) return res.status(400).json({ message: 'Invalid service ID.' });

  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, id).query('DELETE FROM serviceslist WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Service not found.' });
    }

    res.status(200).json({ message: 'Service deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting service.', error: error.message });
  }
});

module.exports = router;
