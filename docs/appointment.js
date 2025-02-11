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
 *     summary: Retrieve all appointments
 *     description: Fetches all appointments along with related details such as patient, dentist, schedule, timeslot, and services. Requires authentication.
 *     tags: [Appointments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all appointments.
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
 *         description: Unauthorized access. Token is missing or invalid.
 *
 *   post:
 *     summary: Create a new appointment
 *     description: |
 *       Creates a new appointment. Requires authentication.
 *       
 *       - The patient must have an existing health declaration (automatically validated).
 *       - If the health declaration is missing, the appointment will not be created.
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
 *         description: Successfully created an appointment.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Appointment created successfully."
 *                 data:
 *                   type: object
 *                   properties:
 *                     appointmentId:
 *                       type: integer
 *                       example: 123
 *       400:
 *         description: |
 *           Invalid input data or missing health declaration.
 *           Possible error messages:
 *           - "Missing required fields or invalid service list."
 *           - "Health declaration not found. Appointment cannot be created."
 *       401:
 *         description: Unauthorized access. Token is missing or invalid.
 *
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 6
 *         status:
 *           type: string
 *           example: "pending"
 *         appointment_type:
 *           type: string
 *           example: "online"
 *         patient:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             fullname:
 *               type: string
 *               example: "John Doe"
 *         dentist:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 11
 *             fullname:
 *               type: string
 *               example: "Dr. Jane Smith"
 *         schedule:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 28
 *             date:
 *               type: string
 *               example: "2025-02-12"
 *         timeslot:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 86
 *             start_time:
 *               type: string
 *               example: "07:00"
 *             end_time:
 *               type: string
 *               example: "08:00"
 *         services:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: integer
 *                 example: 2
 *               service_name:
 *                 type: string
 *                 example: "Dental Implants"
 *               title:
 *                 type: string
 *                 example: "Restore Your Confidence"
 *               content:
 *                 type: string
 *                 example: "Get high-quality dental implants..."
 *               photo:
 *                 type: string
 *                 example: "https://example.com/images/implants.jpg"
 *
 *     AppointmentInput:
 *       type: object
 *       required:
 *         - patient_id
 *         - dentist_id
 *         - schedule_id
 *         - timeslot_id
 *         - status
 *         - appointment_type
 *         - service_list_id
 *       properties:
 *         patient_id:
 *           type: integer
 *           example: 1
 *         dentist_id:
 *           type: integer
 *           example: 11
 *         schedule_id:
 *           type: integer
 *           example: 28
 *         timeslot_id:
 *           type: integer
 *           example: 86
 *         status:
 *           type: string
 *           example: "pending"
 *         appointment_type:
 *           type: string
 *           example: "online"
 *         service_list_id:
 *           type: array
 *           items:
 *             type: integer
 *           example: [2, 1]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Appointment'
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
 *     summary: Get appointments by patient ID
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
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
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Appointment'
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
 *         patient_fullname:
 *           type: string
 *           example: "John Doe"
 *         dentist_id:
 *           type: integer
 *           example: 202
 *         dentist_fullname:
 *           type: string
 *           example: "Dr. Jane Smith"
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
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-02-05T10:00:00Z"

 *     AppointmentInput:
 *       type: object
 *       required:
 *         - patient_id
 *         - dentist_id
 *         - schedule_id
 *         - timeslot_id
 *         - status
 *         - appointment_type
 *         - service_list_id
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
 */
