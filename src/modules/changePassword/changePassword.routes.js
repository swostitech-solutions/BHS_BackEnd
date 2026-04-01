///// currently working code 31 march ////


// const express = require("express");
// const router = express.Router();
// const controller = require("./changePassword.controller");
// const authMiddleware = require("../../middlewares/authMiddleware");


// /**
//  * @swagger
//  * /change-password:
//  *   post:
//  *     summary: Change user password
//  *     tags: [Auth]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - user_id
//  *               - current_password
//  *               - new_password
//  *               - confirm_password
//  *             properties:
//  *               user_id:
//  *                 type: integer
//  *               current_password:
//  *                 type: string
//  *               new_password:
//  *                 type: string
//  *               confirm_password:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: Password changed successfully
//  *       400:
//  *         description: Validation error
//  *       404:
//  *         description: User not found
//  *       500:
//  *         description: Server error
//  */
// router.post("/", controller.changePassword);

// module.exports = router;















const express = require("express");
const router = express.Router();
const controller = require("./changePassword.controller");

/**
 * @swagger
 * tags:
 *   name: Change Password (OTP - No Auth)
 *   description: OTP-based change password using username (no login required)
 */

/**
 * @swagger
 * /change-password/request-otp:
 *   post:
 *     summary: Step 1 - Verify current password and send OTP
 *     tags: [Change Password (OTP - No Auth)]
 *     description: User provides username and current password. OTP is sent to registered mobile number.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - current_password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Surya10"
 *               current_password:
 *                 type: string
 *                 example: "Surya@10"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "OTP sent successfully"
 *               mobile: "79******81"
 *       400:
 *         description: Missing fields or incorrect password
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/request-otp", controller.requestOtp);

/**
 * @swagger
 * /change-password/verify-otp:
 *   post:
 *     summary: Step 2 - Verify OTP
 *     tags: [Change Password (OTP - No Auth)]
 *     description: Verify OTP sent to user's registered mobile number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - otp
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Surya10"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "OTP verified"
 *               token: "generated_reset_token_here"
 *       400:
 *         description: Invalid OTP / expired / attempts exceeded
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/verify-otp", controller.verifyOtp);

/**
 * @swagger
 * /change-password:
 *   post:
 *     summary: Step 3 - Change password using OTP token
 *     tags: [Change Password (OTP - No Auth)]
 *     description: Final step to update password after OTP verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - token
 *               - new_password
 *               - confirm_password
 *             properties:
 *               username:
 *                 type: string
 *                 example: "Surya10"
 *               token:
 *                 type: string
 *                 example: "a8f9c2d3e4f5abc123"
 *               new_password:
 *                 type: string
 *                 example: "NewPassword@123"
 *               confirm_password:
 *                 type: string
 *                 example: "NewPassword@123"
 *     responses:
 *       200:
 *         description: Password changed successfully
 *         content:
 *           application/json:
 *             example:
 *               message: "Password changed successfully"
 *       400:
 *         description: Validation error / invalid token / mismatch password
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/", controller.changePassword);

module.exports = router;