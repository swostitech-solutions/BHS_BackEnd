const express = require("express");
const router = express.Router();
const controller = require("./changePassword.controller");
const authMiddleware = require("../../middlewares/authMiddleware");


/**
 * @swagger
 * /change-password:
 *   post:
 *     summary: Change user password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - current_password
 *               - new_password
 *               - confirm_password
 *             properties:
 *               user_id:
 *                 type: integer
 *               current_password:
 *                 type: string
 *               new_password:
 *                 type: string
 *               confirm_password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/", controller.changePassword);

module.exports = router;
