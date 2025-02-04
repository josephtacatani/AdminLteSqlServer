/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: API endpoints for managing dentist schedules
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Schedule:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         dentist_id:
 *           type: integer
 *           example: 101
 *         date:
 *           type: string
 *           format: date
 *           example: "2025-05-15"
 *         start_time:
 *           type: string
 *           format: time
 *           example: "09:00"
 *         end_time:
 *           type: string
 *           format: time
 *           example: "17:00"
 *         created_at:
 *           type: string
 *           format: date-time
 *           example: "2025-05-01T10:00:00Z"
 *         updated_at:
 *           type: string
 *           format: date-time
 *           example: "2025-05-10T14:00:00Z"
 */

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: Retrieve all schedules
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Schedules retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Schedules retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       401:
 *         description: Unauthorized access. Token missing or invalid.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     summary: Retrieve a schedule by ID
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the schedule.
 *     responses:
 *       200:
 *         description: Schedule retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Schedule retrieved successfully."
 *                 data:
 *                   $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: Schedule not found.
 *       401:
 *         description: Unauthorized access.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Create a new schedule
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - dentist_id
 *               - date
 *               - start_time
 *               - end_time
 *             properties:
 *               dentist_id:
 *                 type: integer
 *                 example: 101
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-05-15"
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "17:00"
 *     responses:
 *       201:
 *         description: Schedule created successfully.
 *       400:
 *         description: Bad request. Missing required fields.
 *       401:
 *         description: Unauthorized access.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /schedules/{id}:
 *   put:
 *     summary: Update an existing schedule
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the schedule to update.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dentist_id:
 *                 type: integer
 *                 example: 101
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-05-15"
 *               start_time:
 *                 type: string
 *                 format: time
 *                 example: "09:00"
 *               end_time:
 *                 type: string
 *                 format: time
 *                 example: "17:00"
 *     responses:
 *       200:
 *         description: Schedule updated successfully.
 *       404:
 *         description: Schedule not found.
 *       400:
 *         description: Bad request.
 *       401:
 *         description: Unauthorized access.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: Delete a schedule
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the schedule to delete.
 *     responses:
 *       200:
 *         description: Schedule and associated timeslots deleted successfully.
 *       404:
 *         description: Schedule not found.
 *       401:
 *         description: Unauthorized access.
 *       500:
 *         description: Internal Server Error.
 */

/**
 * @swagger
 * /schedules/dentist/{dentistId}:
 *   get:
 *     summary: Retrieve schedules for a specific dentist
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dentistId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the dentist.
 *     responses:
 *       200:
 *         description: Schedules retrieved successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Schedules retrieved successfully."
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Schedule'
 *       404:
 *         description: No schedules found for this dentist.
 *       401:
 *         description: Unauthorized access.
 *       500:
 *         description: Internal Server Error.
 */
