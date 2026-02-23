// const express = require("express");
// const router = express.Router();
// const walletController = require("./wallet.controller");

// /**
//  * @swagger
//  * tags:
//  *   name: Wallet
//  *   description: Technician Wallet APIs
//  */

// /**
//  * @swagger
//  * /wallet/topup:
//  *   post:
//  *     summary: Add money to technician wallet (Juspay)
//  *     tags: [Wallet]
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - technician_id
//  *               - amount
//  *               - email
//  *               - mobile
//  *             properties:
//  *               technician_id:
//  *                 type: integer
//  *                 example: 12
//  *               amount:
//  *                 type: number
//  *                 example: 500
//  *               email:
//  *                 type: string
//  *                 example: tech@test.com
//  *               mobile:
//  *                 type: string
//  *                 example: 9999999999
//  *     responses:
//  *       200:
//  *         description: Wallet top-up order created successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 success:
//  *                   type: boolean
//  *                   example: true
//  *                 order_id:
//  *                   type: string
//  *                   example: WL1700000000000
//  *                 payment_urls:
//  *                   type: object
//  *                   properties:
//  *                     web:
//  *                       type: string
//  *                       example: https://secure.juspay.in/payment-page
//  *                     mobile:
//  *                       type: string
//  *                       nullable: true
//  *                     iframe:
//  *                       type: string
//  *                       nullable: true
//  *       400:
//  *         description: Invalid request payload
//  *       500:
//  *         description: Wallet topup failed
//  */
// router.post("/topup", walletController.createWalletTopup);

// /**
//  * @swagger
//  * /wallet/{technicianId}:
//  *   get:
//  *     summary: Get technician wallet balance
//  *     tags: [Wallet]
//  *     parameters:
//  *       - in: path
//  *         name: technicianId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         example: 12
//  *     responses:
//  *       200:
//  *         description: Wallet balance fetched successfully
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: object
//  *               properties:
//  *                 balance:
//  *                   type: number
//  *                   example: 1250
//  */
// router.get("/:technicianId", walletController.getWalletBalance);

// /**
//  * @swagger
//  * /wallet/{technicianId}/transactions:
//  *   get:
//  *     summary: Get technician wallet transaction history
//  *     tags: [Wallet]
//  *     parameters:
//  *       - in: path
//  *         name: technicianId
//  *         required: true
//  *         schema:
//  *           type: integer
//  *         example: 12
//  *     responses:
//  *       200:
//  *         description: Wallet transaction list
//  *         content:
//  *           application/json:
//  *             schema:
//  *               type: array
//  *               items:
//  *                 type: object
//  *                 properties:
//  *                   id:
//  *                     type: integer
//  *                     example: 1
//  *                   type:
//  *                     type: string
//  *                     example: CREDIT
//  *                   amount:
//  *                     type: number
//  *                     example: 500
//  *                   source:
//  *                     type: string
//  *                     example: TOPUP
//  *                   status:
//  *                     type: string
//  *                     example: SUCCESS
//  *                   createdAt:
//  *                     type: string
//  *                     example: 2024-02-02T10:30:00Z
//  */
// router.get(
//   "/:technicianId/transactions",
//   walletController.getWalletTransactions
// );

// module.exports = router;





























////////// currently working properly /////////

const express = require("express");
const router = express.Router();
const walletController = require("./wallet.controller");

/**
 * @swagger
 * tags:
 *   name: Wallet
 *   description: Technician Wallet APIs
 */

/**
 * @swagger
 * /wallet/topup:
 *   post:
 *     summary: Add money to technician wallet (Juspay)
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - technician_id
 *               - amount
 *               - email
 *               - mobile
 *             properties:
 *               technician_id:
 *                 type: integer
 *                 example: 12
 *               amount:
 *                 type: number
 *                 example: 500
 *               email:
 *                 type: string
 *                 example: tech@test.com
 *               mobile:
 *                 type: string
 *                 example: 9999999999
 *     responses:
 *       200:
 *         description: Wallet top-up order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 order_id:
 *                   type: string
 *                   example: WL1700000000000
 *                 payment_urls:
 *                   type: object
 *                   properties:
 *                     web:
 *                       type: string
 *                       example: https://secure.juspay.in/payment-page
 *                     mobile:
 *                       type: string
 *                       nullable: true
 *                     iframe:
 *                       type: string
 *                       nullable: true
 *       400:
 *         description: Invalid request payload
 *       500:
 *         description: Wallet topup failed
 */
router.post("/topup", walletController.createWalletTopup);

// /**
//  * @swagger
//  * /wallet/verify:
//  *   get:
//  *     summary: Verify wallet top-up payment (Juspay redirect)
//  *     tags: [Wallet]
//  *     parameters:
//  *       - in: query
//  *         name: order_id
//  *         required: true
//  *         schema:
//  *           type: string
//  *         example: WL1700000000000
//  *     responses:
//  *       302:
//  *         description: Redirects to wallet success or failure page
//  *       400:
//  *         description: order_id missing
//  *       404:
//  *         description: Transaction not found
//  *       500:
//  *         description: Verification failed
//  */
// router.get("/verify", walletController.verifyWalletTopup);
// router.post("/verify", walletController.verifyWalletTopup);




/**
 * @swagger
 * /wallet/verify:
 *   get:
 *     summary: Verify wallet top-up payment (Juspay redirect)
 *     tags: [Wallet]
 *     parameters:
 *       - in: query
 *         name: order_id
 *         required: true
 *         schema:
 *           type: string
 *         example: WL1700000000000
 *     responses:
 *       302:
 *         description: Redirects to wallet success or failure page
 *       400:
 *         description: order_id missing
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Verification failed
 *   post:
 *     summary: Verify wallet top-up payment (Juspay redirect)
 *     tags: [Wallet]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               order_id:
 *                 type: string
 *                 example: WL1700000000000
 *     responses:
 *       302:
 *         description: Redirects to wallet success or failure page
 */
router.get("/verify", walletController.verifyWalletTopup);
router.post("/verify", walletController.verifyWalletTopup);


/**
 * @swagger
 * /wallet/{technicianId}:
 *   get:
 *     summary: Get technician wallet balance
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: technicianId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: Wallet balance fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 balance:
 *                   type: number
 *                   example: 1250
 */
router.get("/:technicianId", walletController.getWalletBalance);

/**
 * @swagger
 * /wallet/{technicianId}/transactions:
 *   get:
 *     summary: Get technician wallet transaction history
 *     tags: [Wallet]
 *     parameters:
 *       - in: path
 *         name: technicianId
 *         required: true
 *         schema:
 *           type: integer
 *         example: 12
 *     responses:
 *       200:
 *         description: Wallet transaction list
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   technician_id:
 *                     type: integer
 *                     example: 12
 *                   wallet_id:
 *                     type: integer
 *                     example: 3
 *                   order_id:
 *                     type: string
 *                     example: WL1700000000000
 *                   type:
 *                     type: string
 *                     example: CREDIT
 *                   amount:
 *                     type: number
 *                     example: 500
 *                   source:
 *                     type: string
 *                     example: TOPUP
 *                   status:
 *                     type: string
 *                     example: SUCCESS
 *                   createdAt:
 *                     type: string
 *                     example: 2024-02-02T10:30:00Z
 */
router.get(
  "/:technicianId/transactions",
  walletController.getWalletTransactions
);

module.exports = router;



////// wallet withdrawl ////

/**
 * @swagger
 * /wallet/withdraw:
 *   post:
 *     summary: Withdraw money from technician wallet
 *     tags: [Wallet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - technician_id
 *               - amount
 *             properties:
 *               technician_id:
 *                 type: integer
 *                 example: 12
 *               amount:
 *                 type: number
 *                 example: 500
 *     responses:
 *       200:
 *         description: Withdrawal initiated
 *       400:
 *         description: Insufficient wallet balance
 *       500:
 *         description: Server error
 */
router.post("/withdraw", walletController.withdrawFromWallet);















