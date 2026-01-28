const express = require("express");
const router = express.Router();
const controller = require("./emergency_pricing.controller");

/**
 * @swagger
 * tags:
 *   name: Emergency Pricing
 *   description: Manage emergency pricing rules & price calculation
 */

/**
 * @swagger
 * /emergency-pricing:
 *   post:
 *     summary: Create a new emergency pricing rule
 *     tags: [Emergency Pricing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - urgency_level
 *               - label
 *               - percentage_markup
 *               - multiplier
 *             properties:
 *               urgency_level:
 *                 type: string
 *                 example: "super_emergency"
 *               label:
 *                 type: string
 *                 example: "Super Emergency (30–45 mins)"
 *               percentage_markup:
 *                 type: number
 *                 example: 40
 *               multiplier:
 *                 type: number
 *                 example: 1.4
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Emergency pricing rule created
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/", controller.createRule);

/**
 * @swagger
 * /emergency-pricing:
 *   get:
 *     summary: Get all active emergency pricing rules
 *     tags: [Emergency Pricing]
 *     responses:
 *       200:
 *         description: List of rules
 *       500:
 *         description: Server error
 */
router.get("/", controller.getRules);

/**
 * @swagger
 * /emergency-pricing/calculate:
 *   post:
 *     summary: Calculate emergency price for a SubService
 *     tags: [Emergency Pricing]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subservice_id
 *               - urgency_level
 *             properties:
 *               subservice_id:
 *                 type: integer
 *                 example: 11
 *               urgency_level:
 *                 type: string
 *                 example: "super_emergency"
 *     responses:
 *       200:
 *         description: Emergency price calculated
 *       404:
 *         description: Rule or SubService not found
 *       500:
 *         description: Server error
 */
router.post("/calculate", controller.calculateEmergencyPrice);

module.exports = router;
