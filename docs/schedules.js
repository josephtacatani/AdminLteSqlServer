/**
 * @swagger
 * tags:
 *   name: Schedules
 *   description: API endpoints for managing dentist schedules
 */

/**
 * @swagger
 * /schedules:
 *   get:
 *     summary: Get all schedules
 *     description: Retrieves all schedules. Requires authentication.
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       dentist_id:
 *                         type: integer
 *                         example: 1
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2025-02-01"
 *                       start_time:
 *                         type: string
 *                         format: time
 *                         example: "09:00"
 *                       end_time:
 *                         type: string
 *                         format: time
 *                         example: "17:00"
 *                 error:
 *                   type: string
 *                   example: null
 *       401:
 *         description: Unauthorized access. Token missing or invalid.
 */

/**
 * @swagger
 * /schedules/{id}:
 *   get:
 *     summary: Get a schedule by ID
 *     description: Retrieves details of a specific schedule by its ID.
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the schedule to retrieve.
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
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 5
 *                     dentist_id:
 *                       type: integer
 *                       example: 1
 *                     date:
 *                       type: string
 *                       format: date
 *                       example: "2025-02-01"
 *                     start_time:
 *                       type: string
 *                       format: time
 *                       example: "09:00"
 *                     end_time:
 *                       type: string
 *                       format: time
 *                       example: "17:00"
 *                 error:
 *                   type: string
 *                   example: null
 *       404:
 *         description: Schedule not found.
 */

/**
 * @swagger
 * /schedules:
 *   post:
 *     summary: Create a new schedule with automatic timeslot generation
 *     description: Creates a new schedule for a dentist and generates timeslots automatically (excluding 12:00 PM - 1:00 PM).
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dentist_id:
 *                 type: integer
 *                 example: 1
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-01"
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
 *         description: Schedule created successfully with timeslots generated.
 *       400:
 *         description: Invalid input data.
 */

/**
 * @swagger
 * /schedules/{id}:
 *   put:
 *     summary: Update a schedule
 *     description: Updates an existing schedule. Existing timeslots will be regenerated if the date or time is changed.
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
 *                 example: 1
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2025-02-01"
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
 *       400:
 *         description: Bad request due to invalid data.
 *       404:
 *         description: Schedule not found.
 *       500:
 *         description: Internal server error.
 */

/**
 * @swagger
 * /schedules/{id}:
 *   delete:
 *     summary: Delete a schedule
 *     description: Deletes a schedule and all its associated timeslots.
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
 */

/**
 * @swagger
 * /schedules/dentist/{dentistId}:
 *   get:
 *     summary: Get schedules by dentist ID
 *     description: Retrieves all schedules for a specific dentist.
 *     tags: [Schedules]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: dentistId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The dentist's ID to retrieve schedules for.
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
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 5
 *                       date:
 *                         type: string
 *                         format: date
 *                         example: "2025-02-01"
 *                       start_time:
 *                         type: string
 *                         format: time
 *                         example: "09:00"
 *                       end_time:
 *                         type: string
 *                         format: time
 *                         example: "17:00"
 *                 error:
 *                   type: string
 *                   example: null
 *       404:
 *         description: No schedules found for the dentist.
 */