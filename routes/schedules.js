const express = require('express');
const { sql, poolPromise } = require('../db'); // ✅ Using poolPromise for SQL Server
const { verifyToken, verifyRole } = require('../middlewares/auth');
const { successResponse, errorResponse } = require('../utils/responseHelper');

const router = express.Router();

/**
 * ✅ Get all schedules (Token required, no role restrictions)
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        id,
        CONVERT(VARCHAR, date, 23) AS date,  -- Returns YYYY-MM-DD
        CONVERT(VARCHAR, start_time, 108) AS start_time,  -- Returns HH:MM:SS
        CONVERT(VARCHAR, end_time, 108) AS end_time,  -- Returns HH:MM:SS
        created_at,
        updated_at
      FROM schedules
    `);
    successResponse(res, 'Schedules retrieved successfully.', result.recordset);
  } catch (error) {
    errorResponse(res, 'Error fetching schedules.', null, error.message, 500);
  }
});

/**
 * ✅ Get a specific schedule by ID
 */
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  if (isNaN(id)) return errorResponse(res, 'Invalid schedule ID.', null, 'Validation Error', 400);

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          id,
          dentist_id,
          CONVERT(VARCHAR, date, 23) AS date,        -- Formats as 'YYYY-MM-DD'
          CONVERT(VARCHAR, start_time, 108) AS start_time,  -- Formats as 'HH:MM:SS'
          CONVERT(VARCHAR, end_time, 108) AS end_time,      -- Formats as 'HH:MM:SS'
          created_at,
          updated_at
        FROM schedules
        WHERE id = @id
      `);

    if (!result.recordset.length) {
      return errorResponse(res, 'Schedule not found.', null, null, 404);
    }

    successResponse(res, 'Schedule retrieved successfully.', result.recordset[0]);
  } catch (error) {
    errorResponse(res, 'Error fetching schedule.', null, error.message, 500);
  }
});


/**
 * ✅ Create a new schedule with transactional timeslot generation
 */
router.post('/', verifyToken, verifyRole('dentist', 'admin'), async (req, res) => {
  let { dentist_id, date, start_time, end_time } = req.body;

  // ✅ Validate required fields
  if (!dentist_id || !date || !start_time || !end_time) {
    return errorResponse(res, 'Missing required fields.', null, 400);
  }

  // ✅ Validate time format (HH:mm:ss)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    return errorResponse(res, 'Invalid time format. Use HH:mm:ss.', null, 400);
  }

  let transaction;
  try {
    const pool = await poolPromise;
    transaction = pool.transaction();
    await transaction.begin();

    // ✅ Step 1: Check if the dentist exists
    const dentistCheck = await transaction.request()
      .input('dentist_id', sql.Int, dentist_id)
      .query(`SELECT user_id FROM dentists WHERE user_id = @dentist_id`);

    if (!dentistCheck.recordset.length) {
      await transaction.rollback();
      return errorResponse(res, 'Invalid dentist ID.', null, 400);
    }

    // ✅ Step 2: Insert Schedule
    const scheduleResult = await transaction.request()
      .input('dentist_id', sql.Int, dentist_id)
      .input('date', sql.Date, date)
      .input('start_time', sql.Time, start_time)
      .input('end_time', sql.Time, end_time)
      .query(`
        INSERT INTO schedules (dentist_id, date, start_time, end_time) 
        OUTPUT Inserted.id
        VALUES (@dentist_id, @date, @start_time, @end_time)
      `);

    const schedule_id = scheduleResult.recordset[0].id;

    // ✅ Step 3: Generate Timeslots
    let currentTime = start_time;
    const timeslots = [];
    const intervalMinutes = 60;
    const breakStartTime = '12:00:00';
    const breakEndTime = '13:00:00';

    while (currentTime < end_time) {
      if (currentTime >= breakStartTime && currentTime < breakEndTime) {
        currentTime = breakEndTime;
      } else {
        let nextTime = new Date(`1970-01-01T${currentTime}Z`);
        nextTime.setMinutes(nextTime.getMinutes() + intervalMinutes);
        let formattedEndTime = nextTime.toISOString().substr(11, 8);

        timeslots.push({ schedule_id, start_time: currentTime, end_time: formattedEndTime });
        currentTime = formattedEndTime;
      }
    }

    if (timeslots.length > 0) {
      const timeslotQuery = `INSERT INTO timeslots (schedule_id, start_time, end_time) VALUES (@schedule_id, @start_time, @end_time)`;
      const timeslotRequest = transaction.request();
      for (const slot of timeslots) {
        await timeslotRequest
          .input('schedule_id', sql.Int, slot.schedule_id)
          .input('start_time', sql.Time, slot.start_time)
          .input('end_time', sql.Time, slot.end_time)
          .query(timeslotQuery);
      }
    } else {
      await transaction.rollback();
      return errorResponse(res, 'No valid timeslots generated.', null, 400);
    }

    await transaction.commit();
    successResponse(res, 'Schedule and timeslots created successfully.', {
      schedule_id,
      dentist_id,
      date,
      start_time,
      end_time,
    });
  } catch (error) {
    if (transaction) await transaction.rollback();
    errorResponse(res, 'Error creating schedule.', null, error.message, 500);
  }
});

router.put('/:id', verifyToken, verifyRole('dentist', 'admin'), async (req, res) => {
  const { id } = req.params;
  let { dentist_id, date, start_time, end_time } = req.body;

  console.log("📌 Received Data:", { id, dentist_id, date, start_time, end_time });

  if (isNaN(id)) return errorResponse(res, 'Invalid schedule ID.', null, 400);
  if (!dentist_id || !date || !start_time || !end_time) {
    return errorResponse(res, 'Missing required fields.', null, 400);
  }

  // ✅ Ensure time is a string and formatted properly
  start_time = String(start_time).trim();
  end_time = String(end_time).trim();

  // ✅ Validate time format (HH:mm:ss)
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  if (!timeRegex.test(start_time) || !timeRegex.test(end_time)) {
    console.error("❌ Invalid Time Format:", start_time, end_time);
    return errorResponse(res, 'Invalid time format. Use HH:mm:ss.', null, 400);
  }

  try {
    const pool = await poolPromise;

    // ✅ Convert time properly before inserting into SQL Server
    const formattedStartTime = start_time.padStart(8, '0'); // Ensures HH:mm:ss format
    const formattedEndTime = end_time.padStart(8, '0');

    console.log("🔹 Formatted Times:", { formattedStartTime, formattedEndTime });

    // ✅ Check if schedule exists before updating
    const existingSchedule = await pool.request()
      .input('id', sql.Int, id)
      .query(`SELECT * FROM schedules WHERE id = @id`);

    if (!existingSchedule.recordset.length) {
      return errorResponse(res, 'Schedule not found.', null, 404);
    }

    // ✅ Perform update query
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('dentist_id', sql.Int, dentist_id)
      .input('date', sql.Date, date)
      .input('start_time', sql.VarChar, formattedStartTime) // ✅ Use varchar for safe insertion
      .input('end_time', sql.VarChar, formattedEndTime) // ✅ Use varchar for safe insertion
      .query(`
        UPDATE schedules
        SET dentist_id = @dentist_id, date = @date, start_time = @start_time, end_time = @end_time, updated_at = GETDATE()
        WHERE id = @id
      `);

    if (result.rowsAffected[0] === 0) {
      return errorResponse(res, 'Failed to update schedule.', null, 400);
    }

    console.log("✅ Schedule Updated Successfully:", { id, dentist_id, date, formattedStartTime, formattedEndTime });

    successResponse(res, 'Schedule updated successfully.', { id, dentist_id, date, start_time: formattedStartTime, end_time: formattedEndTime });
  } catch (error) {
    console.error("❌ Update Schedule Error:", error);
    errorResponse(res, 'Error updating schedule.', null, error.message, 500);
  }
});




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
          CONVERT(VARCHAR, date, 23) AS date,  -- Formats as 'YYYY-MM-DD'
          CONVERT(VARCHAR, start_time, 108) AS start_time,  -- Formats as 'HH:MM:SS'
          CONVERT(VARCHAR, end_time, 108) AS end_time,  -- Formats as 'HH:MM:SS'
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
