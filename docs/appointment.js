/**
 * @swagger
 * tags:
 *   name: Appointments
 *   description: API endpoints for managing appointments
 */

/**
 * @swagger
 * /appointments:
 *   get:
 *     summary: Get all appointments
 *     description: Retrieves all appointments. Requires authentication.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Appointments retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Appointment'
 *       401:
 *         description: Unauthorized access.
 *
 *   post:
 *     summary: Create a new appointment
 *     description: Creates a new appointment. Requires authentication.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentInput'
 *     responses:
 *       201:
 *         description: Appointment created successfully.
 *       400:
 *         description: Invalid input data.
 *       401:
 *         description: Unauthorized access.
 */

/**
 * @swagger
 * /appointments/{id}:
 *   get:
 *     summary: Get appointment by ID
 *     description: Retrieves an appointment by its ID. Requires authentication.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment retrieved successfully.
 *       404:
 *         description: Appointment not found.
 *       401:
 *         description: Unauthorized access.
 *
 *   put:
 *     summary: Update an appointment
 *     description: Updates an existing appointment. Requires authentication.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentInput'
 *     responses:
 *       200:
 *         description: Appointment updated successfully.
 *       400:
 *         description: Invalid input data.
 *       404:
 *         description: Appointment not found.
 *       401:
 *         description: Unauthorized access.
 *
 *   delete:
 *     summary: Delete an appointment
 *     description: Deletes an appointment by ID. Requires authentication.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment deleted successfully.
 *       404:
 *         description: Appointment not found.
 *       401:
 *         description: Unauthorized access.
 */

/**
 * @swagger
 * /appointments/by-patient/{patient_id}:
 *   get:
 *     summary: Get appointment by patient ID
 *     description: Retrieves appointments for a specific patient. Requires authentication.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Appointments retrieved successfully.
 *       404:
 *         description: No appointments found for the patient.
 *       401:
 *         description: Unauthorized access.
 */

/**
 * @swagger
 * /appointments/cancel/{appointment_id}:
 *   patch:
 *     summary: Cancel an appointment
 *     description: Cancels an appointment by updating its status. Requires authentication.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: appointment_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Appointment ID
 *     responses:
 *       200:
 *         description: Appointment canceled successfully.
 *       404:
 *         description: Appointment not found.
 *       401:
 *         description: Unauthorized access.
 */

/**
 * @swagger
 * /appointments/getAllAppointmentsWithServicesByPatientId/{patient_id}:
 *   get:
 *     summary: Get all appointments with services by patient ID
 *     description: Retrieves all appointments along with related services for a specific patient. Requires authentication.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: patient_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Patient ID
 *     responses:
 *       200:
 *         description: Appointments with services retrieved successfully.
 *       404:
 *         description: No appointments found for this patient.
 *       401:
 *         description: Unauthorized access.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         patient_id:
 *           type: integer
 *           example: 101
 *         dentist_id:
 *           type: integer
 *           example: 202
 *         schedule_id:
 *           type: integer
 *           example: 303
 *         timeslot_id:
 *           type: integer
 *           example: 404
 *         status:
 *           type: string
 *           example: "confirmed"
 *         appointment_type:
 *           type: string
 *           example: "checkup"
 *     AppointmentInput:
 *       type: object
 *       properties:
 *         patient_id:
 *           type: integer
 *           example: 101
 *         dentist_id:
 *           type: integer
 *           example: 202
 *         schedule_id:
 *           type: integer
 *           example: 303
 *         timeslot_id:
 *           type: integer
 *           example: 404
 *         status:
 *           type: string
 *           example: "pending"
 *         appointment_type:
 *           type: string
 *           example: "consultation"
 *         service_list_id:
 *           type: array
 *           items:
 *             type: integer
 *           example: [1, 2, 3]
 *         health_declaration_id:
 *           type: integer
 *           example: 505
 */
