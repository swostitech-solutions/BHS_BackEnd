const express = require("express");
const router = express.Router();
const gstController = require("./gst.controller");


/**
 * @swagger
 * /gst/calculate:
 *   post:
 *     summary: Calculate GST for a price
 *     tags: [GST]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - base_amount
 *             properties:
 *               base_amount:
 *                 type: number
 *                 example: 1000
 *               is_inter_state:
 *                 type: boolean
 *                 example: false
 *     responses:
 *       200:
 *         description: GST calculation result
 */
router.post("/calculate", gstController.calculateGst);

module.exports = router;
