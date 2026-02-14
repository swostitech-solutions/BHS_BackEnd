const express = require("express");
const router = express.Router();
const commissionController = require("./commission.controller");

/**
 * @swagger
 * /commission/calculate:
 *   post:
 *     summary: Calculate commission for a base amount
 *     tags: [Commission]
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
 *     responses:
 *       200:
 *         description: Commission calculation result
 */

router.post("/calculate", commissionController.calculateCommission);

module.exports = router;
