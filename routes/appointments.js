const express = require('express');
const { sql, poolPromise } = require('../db'); // SQL Server DB Connection
const { verifyToken } = require('../middlewares/auth'); // JWT Middleware
const { successResponse, errorResponse } = require('../utils/responseHelper'); // Response Helpers

const router = express.Router();

/** ✅ Get All Appointments */
router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM appointments');
    successResponse(res, 'Appointments retrieved successfully.', result.recordset);
  } catch (error) {
    errorResponse(res, 'Error fetching appointments.', null, error.message, 500);
  }
});

/** ✅ Get Appointment by ID */
router.get('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) return errorResponse(res, 'Invalid appointment ID.', null, 400);

  try {
    const pool = await poolPromise;
    const result = await pool.request().input('id', sql.Int, id).query('SELECT * FROM appointments WHERE id = @id');

    if (!result.recordset.length) return errorResponse(res, 'Appointment not found.', null, 404);

    successResponse(res, 'Appointment retrieved successfully.', result.recordset[0]);
  } catch (error) {
    errorResponse(res, 'Error fetching appointment.', null, error.message, 500);
  }
});

/** ✅ Create Appointment */
router.post('/', verifyToken, async (req, res) => {
  const { patient_id, dentist_id, schedule_id, timeslot_id, status, appointment_type, service_list_id, health_declaration_id } = req.body;

  if (!patient_id || !dentist_id || !schedule_id || !timeslot_id || !status || !appointment_type || !Array.isArray(service_list_id) || service_list_id.length === 0) {
    return errorResponse(res, 'Missing required fields or invalid service list.', null, 400);
  }

  try {
    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();

    const appointmentResult = await transaction.request()
      .input('patient_id', sql.Int, patient_id)
      .input('dentist_id', sql.Int, dentist_id)
      .input('schedule_id', sql.Int, schedule_id)
      .input('timeslot_id', sql.Int, timeslot_id)
      .input('status', sql.VarChar, status)
      .input('appointment_type', sql.VarChar, appointment_type)
      .input('health_declaration_id', sql.Int, health_declaration_id)
      .query(`
        INSERT INTO appointments (patient_id, dentist_id, schedule_id, timeslot_id, status, appointment_type, health_declaration_id)
        OUTPUT INSERTED.id
        VALUES (@patient_id, @dentist_id, @schedule_id, @timeslot_id, @status, @appointment_type, @health_declaration_id)
      `);

    const appointmentId = appointmentResult.recordset[0].id;

    for (const serviceId of service_list_id) {
      await transaction.request()
        .input('appointment_id', sql.Int, appointmentId)
        .input('service_list_id', sql.Int, serviceId)
        .query('INSERT INTO appointment_services (appointment_id, service_list_id) VALUES (@appointment_id, @service_list_id)');
    }

    await transaction.commit();
    successResponse(res, 'Appointment created successfully.', { appointmentId });

  } catch (error) {
    errorResponse(res, 'Error creating appointment.', null, error.message, 500);
  }
});

/** ✅ Update Appointment */
router.put('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;
  const { patient_id, dentist_id, schedule_id, timeslot_id, status, appointment_type, service_list_id, health_declaration_id } = req.body;

  if (!patient_id || !dentist_id || !schedule_id || !timeslot_id || !status || !appointment_type || !Array.isArray(service_list_id) || service_list_id.length === 0) {
    return errorResponse(res, 'Missing required fields or invalid service list.', null, 400);
  }

  try {
    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();

    await transaction.request().input('id', sql.Int, id).query('DELETE FROM appointment_services WHERE appointment_id = @id');

    await transaction.request()
      .input('id', sql.Int, id)
      .input('patient_id', sql.Int, patient_id)
      .input('dentist_id', sql.Int, dentist_id)
      .input('schedule_id', sql.Int, schedule_id)
      .input('timeslot_id', sql.Int, timeslot_id)
      .input('status', sql.VarChar, status)
      .input('appointment_type', sql.VarChar, appointment_type)
      .input('health_declaration_id', sql.Int, health_declaration_id)
      .query(`
        UPDATE appointments
        SET patient_id = @patient_id, dentist_id = @dentist_id, schedule_id = @schedule_id,
            timeslot_id = @timeslot_id, status = @status, appointment_type = @appointment_type,
            health_declaration_id = @health_declaration_id
        WHERE id = @id
      `);

    for (const serviceId of service_list_id) {
      await transaction.request()
        .input('appointment_id', sql.Int, id)
        .input('service_list_id', sql.Int, serviceId)
        .query('INSERT INTO appointment_services (appointment_id, service_list_id) VALUES (@appointment_id, @service_list_id)');
    }

    await transaction.commit();
    successResponse(res, 'Appointment updated successfully.', { appointmentId: id });

  } catch (error) {
    errorResponse(res, 'Error updating appointment.', null, error.message, 500);
  }
});

/** ✅ Delete Appointment */
router.delete('/:id', verifyToken, async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) return errorResponse(res, 'Invalid appointment ID.', null, 400);

  try {
    const pool = await poolPromise;
    const transaction = pool.transaction();
    await transaction.begin();

    await transaction.request().input('id', sql.Int, id).query('DELETE FROM appointment_services WHERE appointment_id = @id');
    const result = await transaction.request().input('id', sql.Int, id).query('DELETE FROM appointments WHERE id = @id');

    if (result.rowsAffected[0] === 0) {
      await transaction.rollback();
      return errorResponse(res, 'Appointment not found.', null, 404);
    }

    await transaction.commit();
    successResponse(res, 'Appointment deleted successfully.');

  } catch (error) {
    errorResponse(res, 'Error deleting appointment.', null, error.message, 500);
  }
});

/** ✅ Get Appointment by Patient ID */
router.get('/by-patient/:patient_id', verifyToken, async (req, res) => {
  const { patient_id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('patient_id', sql.Int, patient_id)
      .query('SELECT * FROM appointments WHERE patient_id = @patient_id');

    if (!result.recordset.length) return errorResponse(res, 'No appointment found for this patient.', null, 404);

    successResponse(res, 'Appointment retrieved successfully.', result.recordset);
  } catch (error) {
    errorResponse(res, 'Error fetching appointment by patient ID.', null, error.message, 500);
  }
});

/** ✅ Cancel Appointment */
router.patch('/cancel/:appointment_id', verifyToken, async (req, res) => {
  const { appointment_id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('appointment_id', sql.Int, appointment_id)
      .query(`UPDATE appointments SET status = 'canceled' WHERE id = @appointment_id`);

    if (result.rowsAffected[0] === 0) return errorResponse(res, 'Appointment not found.', null, 404);

    successResponse(res, 'Appointment canceled successfully.', { appointment_id });
  } catch (error) {
    errorResponse(res, 'Error canceling appointment.', null, error.message, 500);
  }
});

/** ✅ Get All Appointments with Services by Patient ID */
router.get('/getAllAppointmentsWithServicesByPatientId/:patient_id', verifyToken, async (req, res) => {
  const { patient_id } = req.params;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('patient_id', sql.Int, patient_id)
      .query(`
        SELECT a.id AS appointment_id, a.status, a.appointment_type, s.date AS schedule_date,
               t.start_time, t.end_time, sv.id AS service_id, sv.service_name
        FROM appointments a
        JOIN schedules s ON a.schedule_id = s.id
        JOIN timeslots t ON a.timeslot_id = t.id
        LEFT JOIN appointment_services aps ON a.id = aps.appointment_id
        LEFT JOIN serviceslist sv ON aps.service_list_id = sv.id
        WHERE a.patient_id = @patient_id
        ORDER BY a.created_at DESC
      `);

    if (!result.recordset.length) return successResponse(res, 'No appointments found for this patient.', []);

    const groupedAppointments = result.recordset.reduce((acc, row) => {
      const { appointment_id, status, appointment_type, schedule_date, start_time, end_time, service_id, service_name } = row;

      if (!acc[appointment_id]) {
        acc[appointment_id] = {
          appointment_id,
          status,
          appointment_type,
          schedule_date,
          start_time,
          end_time,
          services: []
        };
      }

      if (service_id) {
        acc[appointment_id].services.push({ service_id, service_name });
      }

      return acc;
    }, {});

    successResponse(res, 'Appointments with services retrieved successfully.', Object.values(groupedAppointments));
  } catch (error) {
    errorResponse(res, 'Error fetching appointments with services.', null, error.message, 500);
  }
});

module.exports = router;
