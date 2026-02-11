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
 * /emergency-pricing/{id}:
 *   put:
 *     summary: Update an emergency pricing rule
 *     description: Update any field of an existing emergency pricing rule. All fields are optional, but at least one must be provided.
 *     tags: [Emergency Pricing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the emergency pricing rule
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               urgency_level:
 *                 type: string
 *                 example: "super_emergency"
 *               label:
 *                 type: string
 *                 example: "Super Emergency (15–30 mins)"
 *               percentage_markup:
 *                 type: number
 *                 example: 60
 *               multiplier:
 *                 type: number
 *                 example: 1.6
 *               is_active:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Emergency pricing rule updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Emergency pricing rule updated successfully
 *                 rule:
 *                   type: object
 *       400:
 *         description: Validation error (invalid numeric values)
 *       404:
 *         description: Pricing rule not found
 *       500:
 *         description: Server error
 */
router.put("/:id", controller.updateRule);




/**
 * @swagger
 * /emergency-pricing/{id}:
 *   delete:
 *     summary: Delete (deactivate) an emergency pricing rule
 *     tags: [Emergency Pricing]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rule deleted successfully
 *       404:
 *         description: Rule not found
 */
router.delete("/:id", controller.deleteRule);



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
