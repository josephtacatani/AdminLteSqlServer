const express = require('express');
const { sql, poolPromise } = require('../db');
const { verifyToken, verifyRole } = require('../middlewares/auth');
const { successResponse, errorResponse } = require('../utils/responseHelper');
const { generateTimeslots } = require('../utils/timeslotHelper');

const router = express.Router();

// ✅ Validate time format (HH:mm)
const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

/**
 * ✅ Create a new schedule with timeslots
 */
router.post('/', verifyToken, verifyRole('dentist', 'admin'), async (req, res) => {
  const { dentist_id, date, start_time, end_time } = req.body;

  if (!dentist_id || !date || !start_time || !end_time) {
    return errorResponse(res, 'Missing required fields.', null, 400);
  }

  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    return errorResponse(res, 'Invalid time format. Use HH:mm.', null, 400);
  }

  try {
    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();

    const dentistCheck = await transaction.request()
      .input('dentist_id', sql.Int, dentist_id)
      .query(`SELECT user_id FROM dentists WHERE user_id = @dentist_id`);

    if (!dentistCheck.recordset.length) {
      await transaction.rollback();
      return errorResponse(res, 'Invalid dentist ID.', null, 400);
    }

    const scheduleResult = await transaction.request()
      .input('dentist_id', sql.Int, dentist_id)
      .input('date', sql.Date, date)
      .input('start_time', sql.VarChar(5), start_time)
      .input('end_time', sql.VarChar(5), end_time)
      .query(`
        INSERT INTO schedules (dentist_id, date, start_time, end_time)
        OUTPUT Inserted.id
        VALUES (@dentist_id, @date, @start_time, @end_time)
      `);

    const schedule_id = scheduleResult.recordset[0].id;

    const timeslots = generateTimeslots(start_time, end_time);

    for (const slot of timeslots) {
      await transaction.request()
        .input('schedule_id', sql.Int, schedule_id)
        .input('start_time', sql.VarChar(5), slot.start_time)
        .input('end_time', sql.VarChar(5), slot.end_time)
        .query(`
          INSERT INTO timeslots (schedule_id, start_time, end_time)
          VALUES (@schedule_id, @start_time, @end_time)
        `);
    }

    await transaction.commit();
    successResponse(res, 'Schedule and timeslots created successfully.', {
      schedule_id,
      dentist_id,
      date,
      start_time,
      end_time,
      timeslots,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    errorResponse(res, 'Error creating schedule.', null, error.message, 500);
  }
});

/**
 * ✅ Update a schedule with timeslot regeneration
 */
router.put('/:id', verifyToken, verifyRole('dentist', 'admin'), async (req, res) => {
  const { id } = req.params;
  const { dentist_id, date, start_time, end_time } = req.body;

  if (!dentist_id || !date || !start_time || !end_time) {
    return errorResponse(res, 'Missing required fields.', null, 400);
  }

  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    return errorResponse(res, 'Invalid time format. Use HH:mm.', null, 400);
  }

  try {
    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();

    const existingSchedule = await transaction.request()
      .input('id', sql.Int, id)
      .query(`SELECT * FROM schedules WHERE id = @id`);

    if (!existingSchedule.recordset.length) {
      await transaction.rollback();
      return errorResponse(res, 'Schedule not found.', null, 404);
    }

    await transaction.request()
      .input('id', sql.Int, id)
      .input('dentist_id', sql.Int, dentist_id)
      .input('date', sql.Date, date)
      .input('start_time', sql.VarChar(5), start_time)
      .input('end_time', sql.VarChar(5), end_time)
      .query(`
        UPDATE schedules
        SET dentist_id = @dentist_id, date = @date, start_time = @start_time, end_time = @end_time, updated_at = GETDATE()
        WHERE id = @id
      `);

    await transaction.request()
      .input('schedule_id', sql.Int, id)
      .query(`DELETE FROM timeslots WHERE schedule_id = @schedule_id`);

    const timeslots = generateTimeslots(start_time, end_time);
    for (const slot of timeslots) {
      await transaction.request()
        .input('schedule_id', sql.Int, id)
        .input('start_time', sql.VarChar(5), slot.start_time)
        .input('end_time', sql.VarChar(5), slot.end_time)
        .query(`
          INSERT INTO timeslots (schedule_id, start_time, end_time)
          VALUES (@schedule_id, @start_time, @end_time)
        `);
    }

    await transaction.commit();
    successResponse(res, 'Schedule and timeslots updated successfully.', {
      id,
      dentist_id,
      date,
      start_time,
      end_time,
      timeslots,
    });
  } catch (error) {
    console.error("❌ Error:", error);
    errorResponse(res, 'Error updating schedule.', null, error.message, 500);
  }
});


/**
 * ✅ Get schedules for a specific dentist
 */
router.get('/dentist/:dentistId', verifyToken, async (req, res) => {
  const { dentistId } = req.params;

  if (isNaN(dentistId)) {
    return errorResponse(res, 'Invalid dentist ID.', null, 400);
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('dentistId', sql.Int, dentistId)
      .query(`
        SELECT 
          id,
          CONVERT(VARCHAR, date, 23) AS date,
          start_time,
          end_time,
          created_at,
          updated_at
        FROM schedules
        WHERE dentist_id = @dentistId
      `);

    successResponse(res, 'Schedules retrieved successfully.', result.recordset);
  } catch (error) {
    errorResponse(res, 'Error fetching schedules for dentist.', null, error.message, 500);
  }
});

module.exports = router;