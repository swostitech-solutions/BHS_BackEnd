const express = require("express");
const router = express.Router();
const controller = require("./service.controller");
const upload = require("./upload.middleware");



/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Service management
 */

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service
 *     description: Creates a service with auto-generated service_code and optional image upload.
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: AC Repair
 *               description:
 *                 type: string
 *                 example: Professional AC service & maintenance
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Service image/icon
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */
router.post("/", upload.single("image"), controller.createService);


/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all services
 *     description: Returns list of services including auto-generated service_code
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Services fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       service_code:
 *                         type: string
 *                         example: AC10001
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       image:
 *                         type: string
 *                         example: ac-service.jpg
 *                       createdAt:
 *                         type: string
 *                       updatedAt:
 *                         type: string
 *       500:
 *         description: Server error
 */
router.get("/", controller.getServices);

/**
 * @swagger
 * /services/{id}:
 *   get:
 *     summary: Get service by ID
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service data
 *       404:
 *         description: Service not found
 */
router.get("/:id", controller.getServiceById);

/**
 * @swagger
 * /services/{id}:
 *   patch:
 *     summary: Update a service (name, description, image)
 *     description: Updates service fields. Supports multipart form-data with optional image upload.
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: false
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: AC Service
 *               description:
 *                 type: string
 *                 example: Updated AC repair description
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Replace service image
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.patch("/:id", upload.single("image"), controller.updateService);

/**
 * @swagger
 * /services/{id}:
 *   delete:
 *     summary: Delete a service
 *     tags: [Services]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service deleted
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", controller.deleteService);

module.exports = router;
