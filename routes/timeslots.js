const express = require('express');
const { sql, poolPromise } = require('../db'); // SQL Server DB Connection
const { verifyToken } = require('../middlewares/auth'); // JWT Middleware
const { successResponse, errorResponse } = require('../utils/responseHelper'); // Response Helpers

const router = express.Router();

/** ✅ Get All Timeslots */
router.get('/all', verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT id, schedule_id, start_time, end_time
      FROM timeslots;
    `);
    successResponse(res, result.recordset.length ? 'All timeslots retrieved successfully.' : 'No timeslots found.', result.recordset);
  } catch (error) {
    errorResponse(res, 'Error fetching all timeslots.', error.message, 500);
  }
});

/** ✅ Get Available Timeslots by Schedule ID */
router.get('/available/:schedule_id', verifyToken, async (req, res) => {
  const { schedule_id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('schedule_id', sql.Int, schedule_id)
      .query(`
        SELECT t.id, t.schedule_id, t.start_time, t.end_time
        FROM timeslots t
        LEFT JOIN appointments a ON t.id = a.timeslot_id AND a.status != 'canceled'
        WHERE a.timeslot_id IS NULL AND t.schedule_id = @schedule_id;
      `);
    successResponse(res, result.recordset.length ? 'Available timeslots retrieved successfully.' : 'No available timeslots found.', result.recordset);
  } catch (error) {
    errorResponse(res, 'Error fetching available timeslots.', error.message, 500);
  }
});

/** ✅ Get All Timeslots by Schedule ID */
router.get('/all/:schedule_id', verifyToken, async (req, res) => {
  const { schedule_id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('schedule_id', sql.Int, schedule_id)
      .query(`
        SELECT id, schedule_id, start_time, end_time
        FROM timeslots
        WHERE schedule_id = @schedule_id;
      `);
    successResponse(res, result.recordset.length ? 'All timeslots retrieved successfully for the given schedule ID.' : 'No timeslots found for the given schedule ID.', result.recordset);
  } catch (error) {
    errorResponse(res, 'Error fetching timeslots by schedule ID.', error.message, 500);
  }
});

/** ✅ Get a Single Timeslot by ID */
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT id, schedule_id, start_time, end_time
        FROM timeslots
        WHERE id = @id;
      `);
    if (!result.recordset.length) {
      return errorResponse(res, 'Timeslot not found.', 'No timeslot found with the given ID.', 404);
    }
    successResponse(res, 'Timeslot retrieved successfully.', result.recordset[0]);
  } catch (error) {
    errorResponse(res, 'Error fetching the timeslot.', error.message, 500);
  }
});

module.exports = router;