const express = require("express");
const router = express.Router();
const controller = require("./feedback.controller");


/**
 * @swagger
 * tags:
 *   name: Feedback
 *   description: Technician feedback and rating management
 */

/**
 * @swagger
 * /feedback:
 *   post:
 *     summary: Submit feedback for a technician
 *     tags: [Feedback]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - technician_id
 *               - rating
 *               - service_code
 *               - subservice_code
 *             properties:
 *               user_id:
 *                 type: integer
 *                 description: User ID who gives the feedback
 *                 example: 8
 *               technician_id:
 *                 type: integer
 *                 description: Technician User ID (NOT technician table PK)
 *                 example: 15
 *               rating:
 *                 type: number
 *                 format: float
 *                 minimum: 1
 *                 maximum: 5
 *                 example: 4.5
 *               comment:
 *                 type: string
 *                 example: Very professional service
 *               service_code:
 *                 type: string
 *                 example: A10001
 *               subservice_code:
 *                 type: string
 *                 example: A10001-02
 *     responses:
 *       201:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Feedback submitted successfully
 *                 rating:
 *                   type: string
 *                   example: "4.5"
 *                 rating_count:
 *                   type: integer
 *                   example: 1
 *       400:
 *         description: Missing or invalid input
 *       404:
 *         description: Technician not found
 *       500:
 *         description: Server error
 */
router.post("/",controller.createFeedback);

/**
 * @swagger
 * /feedback:
 *   get:
 *     summary: Get all feedback with user & technician details
 *     tags: [Feedback]
 *     responses:
 *       200:
 *         description: List of all feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feedbacks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_id:
 *                         type: integer
 *                       technician_id:
 *                         type: integer
 *                         description: Technician User ID
 *                       rating:
 *                         type: string
 *                         example: "4.5"
 *                       comment:
 *                         type: string
 *                       service_code:
 *                         type: string
 *                       subservice_code:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           username:
 *                             type: string
 *                       technician:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           mobile:
 *                             type: string
 *                           address:
 *                             type: string
 *                           username:
 *                             type: string
 *                           roleId:
 *                             type: integer
 *                           roleName:
 *                             type: string
 *                             example: Technician
 *                           rating:
 *                             type: object
 *                             properties:
 *                               avg_rating:
 *                                 type: string
 *                                 example: "4.5"
 *                               rating_count:
 *                                 type: integer
 *                                 example: 3
 *       500:
 *         description: Server error
 */
router.get("/", controller.getAllFeedbacks);

/**
 * @swagger
 * /feedback/technician/{technician_id}:
 *   get:
 *     summary: Get feedback for a specific technician
 *     tags: [Feedback]
 *     parameters:
 *       - in: path
 *         name: technician_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Technician User ID
 *         example: 15
 *     responses:
 *       200:
 *         description: Feedback list for technician
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 feedbacks:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       user_id:
 *                         type: integer
 *                       technician_id:
 *                         type: integer
 *                       rating:
 *                         type: string
 *                       comment:
 *                         type: string
 *                       service_code:
 *                         type: string
 *                       subservice_code:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           name:
 *                             type: string
 *                           username:
 *                             type: string
 *       404:
 *         description: Technician not found
 *       500:
 *         description: Server error
 */
router.get("/technician/:technician_id", controller.getFeedbackByTechnician);

module.exports = router;
