const express = require("express");
const router = express.Router();
const controller = require("./subservice.controller");
const upload = require("./upload.middleware");

/**
 * @swagger
 * tags:
 *   name: SubServices
 *   description: SubService management APIs
 */

/**
 * @swagger
 * /subservices:
 *   post:
 *     summary: Create a new SubService
 *     description: Creates a subservice with auto-generated subservice_code under a parent service (using serviceCode) and optional image upload.
 *     tags: [SubServices]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - serviceCode
 *             properties:
 *               name:
 *                 type: string
 *                 example: AC Deep Cleaning
 *               description:
 *                 type: string
 *                 example: Thorough AC cleaning and maintenance
 *               price:
 *                 type: number
 *                 example: 499
 *               serviceCode:
 *                 type: string
 *                 example: AC10001
 *                 description: Parent Service code under which this subservice is created
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: SubService image/icon
 *     responses:
 *       201:
 *         description: SubService created successfully with auto-generated subservice_code
 *       400:
 *         description: Missing required fields or invalid serviceCode
 *       500:
 *         description: Server error
 */
router.post("/", upload.single("image"), controller.createSubService);

/**
 * @swagger
 * /subservices:
 *   get:
 *     summary: Get all SubServices
 *     tags: [SubServices]
 *     responses:
 *       200:
 *         description: List of all subservices
 *       500:
 *         description: Server error
 */
router.get("/", controller.getAllSubServices);

/**
 * @swagger
 * /subservices/service/{serviceCode}:
 *   get:
 *     summary: Get all SubServices under a specific Service code
 *     tags: [SubServices]
 *     parameters:
 *       - in: path
 *         name: serviceCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Parent Service code
 *     responses:
 *       200:
 *         description: List of subservices under the given service
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.get("/service/:serviceCode", controller.getByServiceCode);

/**
 * @swagger
 * /subservices/code/{code}:
 *   get:
 *     summary: Get SubService by subservice_code
 *     tags: [SubServices]
 *     parameters:
 *       - in: path
 *         name: code
 *         required: true
 *         schema:
 *           type: string
 *         description: SubService code
 *     responses:
 *       200:
 *         description: SubService data
 *       404:
 *         description: SubService not found
 *       500:
 *         description: Server error
 */
router.get("/code/:code", controller.getByCode);

/**
 * @swagger
 * /subservices/id/{id}:
 *   get:
 *     summary: Get SubService by ID
 *     tags: [SubServices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: SubService ID
 *     responses:
 *       200:
 *         description: SubService data
 *       404:
 *         description: SubService not found
 *       500:
 *         description: Server error
 */
router.get("/id/:id", controller.getSubServiceById);


/**
 * @swagger
 * /subservices/{id}:
 *   put:
 *     summary: Update SubService
 *     description: Update subservice details. Supports multipart/form-data with optional image upload.
 *     tags: [SubServices]
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
 *                 example: AC Cleaning Deluxe
 *               description:
 *                 type: string
 *                 example: Updated description for AC cleaning
 *               price:
 *                 type: number
 *                 example: 599
 *               service_code:
 *                 type: string
 *                 example: AC10001
 *                 description: Parent Service code (used to regenerate subservice_code)
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Replace subservice image
 *     responses:
 *       200:
 *         description: SubService updated successfully
 *       404:
 *         description: SubService not found
 *       400:
 *         description: Invalid request
 *       500:
 *         description: Server error
 */
router.put("/:id", upload.single("image"), controller.updateSubService);

/**
 * @swagger
 * /subservices/{id}:
 *   delete:
 *     summary: Delete SubService
 *     tags: [SubServices]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: SubService deleted successfully
 *       404:
 *         description: SubService not found
 *       500:
 *         description: Server error
 */
router.delete("/:id", controller.deleteSubService);

module.exports = router;


