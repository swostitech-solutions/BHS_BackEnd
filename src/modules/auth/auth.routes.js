const router = require("express").Router();
const controller = require("./auth.controller");
const forgotPasswordController = require("./forgotPassword.controller");
const upload = require("./uploads");
const uploadClient = require("./clientUploads");
const authMiddleware = require("../../middlewares/authMiddleware");
const refreshController = require("./refreshController");

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & Registration APIs
 */

/**
 * @swagger
 * /auth/signup/client:
 *   post:
 *     tags: [Auth]
 *     summary: Client signup
 *     description: Registers a new client user (roleId = 2)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *               address:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Client registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Client registered
 *                 user:
 *                   type: object
 *                   properties:
 *                     id: { type: integer }
 *                     name: { type: string }
 *                     email: { type: string }
 *                     mobile: { type: string }
 *                     address: { type: string }
 *                     username: { type: string }
 *                     roleId: { type: integer, example: 2 }
 *                     roleName: { type: string, example: Client }
 *       400:
 *         description: Username already exists
 *       500:
 *         description: Server error
 */
router.post("/signup/client", controller.signupClient);

/**
 * @swagger
 * /auth/client/profile:
 *   put:
 *     tags: [Auth]
 *     summary: Update client profile
 *     description: >
 *       Allows a logged-in client (roleId = 2) to update profile details
 *       and upload/update a profile photo using multipart/form-data.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: integer
 *                 description: Client user ID
 *                 example: 12
 *               name:
 *                 type: string
 *                 example: Rahul Sharma
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *               address:
 *                 type: string
 *                 example: Bangalore, India
 *
 *               # 📷 Profile Image Upload
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: Client profile photo (jpg, png, webp)
 *     responses:
 *       200:
 *         description: Client profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Client profile updated successfully
 *                 profileImage:
 *                   type: string
 *                   example: /uploads/clients/1704982233445.png
 *       400:
 *         description: Invalid input or missing userId
 *       404:
 *         description: Client not found
 *       500:
 *         description: Server error
 */
router.put(
  "/client/profile",
  uploadClient,
  controller.updateClientProfile
);

/**
 * @swagger
 * /auth/signup/technician:
 *   post:
 *     tags: [Auth]
 *     summary: Technician signup (with documents)
 *     description: Registers a new technician with document uploads (roleId = 3)
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               mobile:
 *                 type: string
 *               address:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               skill:
 *                 type: string
 *               experience:
 *                 type: string
 *               aadharCardNo:
 *                 type: string
 *               panCardNo:
 *                 type: string
 *               bankName:
 *                 type: string
 *               ifscNo:
 *                 type: string
 *               branchName:
 *                 type: string
 *               timeDuration:
 *                 type: string
 *               emergencyAvailable:
 *                 type: boolean
 *               techCategory:
 *                 type: string
 *
 *               # 📄 FILE UPLOADS
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               aadharDoc:
 *                 type: string
 *                 format: binary
 *               panDoc:
 *                 type: string
 *                 format: binary
 *               bankPassbookDoc:
 *                 type: string
 *                 format: binary
 *               experienceCertDoc:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Technician registered, pending approval
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     username:
 *                       type: string
 *                     roleId:
 *                       type: integer
 *                       example: 3
 *                     roleName:
 *                       type: string
 *                       example: Technician
 *                     technicianDetails:
 *                       type: object
 *                       properties:
 *                         skill:
 *                           type: string
 *                         experience:
 *                           type: integer
 *                         aadharCardNo:
 *                           type: string
 *                         panCardNo:
 *                           type: string
 *                         bankName:
 *                           type: string
 *                         ifscNo:
 *                           type: string
 *                         branchName:
 *                           type: string
 *                         status:
 *                           type: string
 *                         timeDuration:
 *                           type: string
 *                         emergencyAvailable:
 *                           type: boolean
 *                         techCategory:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *                           example: /uploads/technicians/12345.jpg
 *                         aadharDoc:
 *                           type: string
 *                           example: /uploads/technicians/aadhar.pdf
 *                         panDoc:
 *                           type: string
 *                           example: /uploads/technicians/pan.pdf
 *                         bankPassbookDoc:
 *                           type: string
 *                           example: /uploads/technicians/passbook.pdf
 *                         experienceCertDoc:
 *                           type: string
 *                           example: /uploads/technicians/experience.pdf
 *       400:
 *         description: Username already exists
 *       500:
 *         description: Server error
 */
router.post("/signup/technician", upload, controller.signupTechnician);

/**
 * @swagger
 * /auth/technician/profile:
 *   put:
 *     tags: [Auth]
 *     summary: Update technician profile
 *     description: >
 *       Allows a logged-in technician to update personal details,
 *       technician details, and re-upload documents after signup.
 *       Uses multipart/form-data.
 *
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               # ---------- USER TABLE ----------
 *               userId:
 *                 type: integer
 *                 example: 12
 *               name:
 *                 type: string
 *                 example: Rahul Kumar
 *               email:
 *                 type: string
 *                 example: rahul.tech@gmail.com
 *               mobile:
 *                 type: string
 *                 example: 9876543210
 *               address:
 *                 type: string
 *                 example: Bangalore
 *
 *               # ---------- TECHNICIAN TABLE ----------
 *               skill:
 *                 type: string
 *                 example: AC Repair
 *               experience:
 *                 type: integer
 *                 example: 5
 *               aadharCardNo:
 *                 type: string
 *                 example: 123412341234
 *               panCardNo:
 *                 type: string
 *                 example: ABCDE1234F
 *               bankName:
 *                 type: string
 *                 example: SBI
 *               ifscNo:
 *                 type: string
 *                 example: SBIN0000123
 *               branchName:
 *                 type: string
 *                 example: MG Road
 *               timeDuration:
 *                 type: string
 *                 example: 9AM - 6PM
 *               emergencyAvailable:
 *                 type: boolean
 *                 example: true
 *               techCategory:
 *                 type: string
 *                 example: Electrical
 *
 *               # ---------- FILE UPLOADS ----------
 *               profileImage:
 *                 type: string
 *                 format: binary
 *               aadharDoc:
 *                 type: string
 *                 format: binary
 *               panDoc:
 *                 type: string
 *                 format: binary
 *               bankPassbookDoc:
 *                 type: string
 *                 format: binary
 *               experienceCertDoc:
 *                 type: string
 *                 format: binary
 *
 *     responses:
 *       200:
 *         description: Technician profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Technician profile updated successfully
 *
 *       400:
 *         description: Invalid input or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *
 *       404:
 *         description: Technician user or profile not found
 *
 *       500:
 *         description: Server error
 */
router.put(
  "/technician/profile",
  upload,
  controller.updateTechnicianProfile
);


/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: User login
 *     description: Login using username & password and returns access & refresh tokens
 *     security: []   # 👈 PUBLIC ENDPOINT (NO AUTH REQUIRED)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin01
 *               password:
 *                 type: string
 *                 example: Admin@123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Login successful
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *                     username:
 *                       type: string
 *                     roleId:
 *                       type: integer
 *       401:
 *         description: Invalid credentials
 *       403:
 *         description: Technician pending approval
 *       404:
 *         description: User not found
 */
router.post("/login", controller.login);


/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Logout user
 *     description: Stateless logout. If JWT is added later, token will be invalidated here.
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Logout successful
 *       500:
 *         description: Server error
 */
router.post("/logout", controller.logout);




// /**
//  * @swagger
//  * /api/auth/refresh-token:
//  *   post:
//  *     tags: [Auth]
//  *     summary: Refresh access token
//  *     description: Generate a new access token using refresh token
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required: [refreshToken]
//  *             properties:
//  *               refreshToken:
//  *                 type: string
//  *     responses:
//  *       200:
//  *         description: New access token generated
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 accessToken:
//  *                   type: string
//  *       401:
//  *         description: Invalid or expired refresh token
//  */
// router.post("/refresh-token", refreshController.refreshToken); 













/**
 * @swagger
 * /auth/users:
 *   get:
 *     security:
 *     - BearerAuth: []
 *     tags: [Auth]
 *     summary: Get all users (Admin, Client, Technician)
 *     description: Returns all users with technicianDetails for technicians
 *     responses:
 *       200:
 *         description: Users fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total: { type: integer }
 *                 users:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id: { type: integer }
 *                       name: { type: string }
 *                       email: { type: string }
 *                       mobile: { type: string }
 *                       address: { type: string }
 *                       username: { type: string }
 *                       roleId: { type: integer }
 *                       roleName: { type: string }
 *                       technicianDetails:
 *                         type: object
 *                         nullable: true
 *                         properties:
 *                           skill: { type: string }
 *                           experience: { type: string }
 *                           aadharCardNo: { type: string }
 *                           panCardNo: { type: string }
 *                           bankName: { type: string }
 *                           ifscNo: { type: string }
 *                           branchName: { type: string }
 *                           status: { type: string }
 *                           timeDuration: { type: string }
 *                           emergencyAvailable: { type: boolean }
 *                           techCategory: { type: string }
 */
router.get("/users", controller.getAllUsers);

/**
 * @swagger
 * /auth/technician/{id}/status:
 *   patch:
 *     tags: [Auth]
 *     summary: Admin approve/reject a technician
 *     description: Update the status of a technician (PENDING → ACCEPT/REJECT)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Technician user ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 description: ACCEPT or REJECT
 *     responses:
 *       200:
 *         description: Technician status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message: { type: string }
 *                 technicianDetails:
 *                   type: object
 *                   properties:
 *                     skill: { type: string }
 *                     experience: { type: string }
 *                     aadharCardNo: { type: string }
 *                     panCardNo: { type: string }
 *                     bankName: { type: string }
 *                     ifscNo: { type: string }
 *                     branchName: { type: string }
 *                     status: { type: string }
 *       400:
 *         description: Invalid status
 *       404:
 *         description: Technician not found
 *       500:
 *         description: Server error
 */
router.patch("/technician/:id/status", controller.updateTechnicianStatus);

/**
 * @swagger
 * /auth/users/{id}:
 *   get:
 *     tags: [Auth]
 *     summary: Get user by ID
 *     description: Returns a single user with role and technician details (if technician)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: User fetched successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.get("/users/:id",  controller.getUserById);

/**
 * @swagger
 * /auth/user/{id}/role/{roleId}:
 *   get:
 *     tags: [Auth]
 *     summary: Get user by ID and role
 *     description: Returns user data only if user matches given roleId
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema: { type: integer }
 *         description: Role ID (2=Client, 3=Technician, 1=Admin)
 *     responses:
 *       200: { description: User fetched successfully }
 *       404: { description: User not found with the given role }
 *       500: { description: Server error }
 */
router.get("/user/:id/role/:roleId", controller.getUserByRole);

/**
 * @swagger
 * /auth/technician/{id}/role/{roleId}:
 *   get:
 *     tags: [Auth]
 *     summary: Get technician by ID and role
 *     description: Returns technician data only if roleId = 3
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: path
 *         name: roleId
 *         required: true
 *         schema: { type: integer }
 *         description: Must be 3 (Technician)
 *     responses:
 *       200: { description: Technician fetched successfully }
 *       400: { description: Role must be Technician (roleId=3) }
 *       404: { description: Technician not found with the given role }
 *       500: { description: Server error }
 */
router.get("/technician/:id/role/:roleId", controller.getTechnicianByRole);


////// Both nodemailer and fast2SMS based forgot password //////

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication & Password Recovery APIs
 */

/* =========================================================
   FORGOT PASSWORD (EMAIL / PHONE)
   ========================================================= */

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: Request password reset (Send OTP via Email or Phone)
 *     description: |
 *       User requests password reset using either:
 *       - **Email** → OTP sent via Email
 *       - **Phone** → OTP sent via SMS (Fast2SMS)
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - identifierType
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email address or phone number
 *                 example: user@example.com
 *               identifierType:
 *                 type: string
 *                 enum: [email, phone]
 *                 example: email
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP sent successfully
 *                 sentTo:
 *                   type: string
 *                   example: u***@example.com
 *                 identifierType:
 *                   type: string
 *                   example: email
 *                 expiresIn:
 *                   type: number
 *                   example: 600
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Server error
 */
router.post("/forgot-password", forgotPasswordController.forgotPassword);

/* =========================================================
   VERIFY OTP (EMAIL / PHONE)
   ========================================================= */

/**
 * @swagger
 * /auth/verify-otp:
 *   post:
 *     summary: Verify OTP
 *     description: Verify OTP received via Email or Phone and receive reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - otp
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or phone used during forgot-password
 *                 example: user@example.com
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: OTP verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: OTP verified successfully
 *                 resetToken:
 *                   type: string
 *                   example: a1b2c3d4e5f6
 *                 expiresAt:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-01-13T11:30:00Z
 *       400:
 *         description: Invalid or expired OTP
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Invalid OTP
 *                 attemptsRemaining:
 *                   type: number
 *                   example: 2
 *       500:
 *         description: Server error
 */
router.post("/verify-otp", forgotPasswordController.verifyOtp);

/* =========================================================
   RESET PASSWORD
   ========================================================= */

/**
 * @swagger
 * /auth/reset-password:
 *   post:
 *     summary: Reset password
 *     description: Reset password using a valid reset token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - resetToken
 *               - newPassword
 *               - confirmPassword
 *             properties:
 *               resetToken:
 *                 type: string
 *                 example: a1b2c3d4e5f6
 *               newPassword:
 *                 type: string
 *                 example: NewSecure@123
 *               confirmPassword:
 *                 type: string
 *                 example: NewSecure@123
 *     responses:
 *       200:
 *         description: Password reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Password reset successfully
 *                 redirectUrl:
 *                   type: string
 *                   example: /login
 *       400:
 *         description: Invalid token or weak password
 *       500:
 *         description: Server error
 */
router.post("/reset-password", forgotPasswordController.resetPassword);

router.get("/mail-test", async (req, res) => {
  try {
    await transporter.verify();

    return res.json({
      success: true,
      message: "SMTP Connected from Render",
    });
  } catch (err) {
    return res.json({
      success: false,
      message: err.message,
      code: err.code,
      command: err.command,
    });
  }
});

module.exports = router;
