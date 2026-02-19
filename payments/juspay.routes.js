  ////// workable code for juspay but only the orederbooking verify id is broken ///////
  
//   const express = require("express");
//   const db = require("../models");
//   const router = express.Router();
//   const juspay = require("./juspay");
//   const config = require("../keys/juspay_config.json");
//   const generateOrderId = require("../src/utils/generateOrderId");

//   /**
//    * @swagger
//    * /payment/juspay/initiate:
//    *   post:
//    *     summary: Create service booking + initiate Juspay payment
//    *     description: |
//    *       This API will:
//    *       1. Generate BD order id from ServiceOnBooking sequence  
//    *       2. Create booking record with payment_method = ONLINE  
//    *       3. Create payment entry  
//    *       4. Initiate Juspay transaction  
//    *       5. Return only required payment URLs
//    *
//    *     tags:
//    *       - Payment
//    *
//    *     requestBody:
//    *       required: true
//    *       content:
//    *         application/json:
//    *           schema:
//    *             type: object
//    *
//    *             required:
//    *               - amount
//    *               - customerId
//    *               - service_code
//    *               - subservice_code
//    *               - address
//    *               - date
//    *               - time_slot
//    *               - quantity
//    *
//    *             properties:
//    *
//    *               amount:
//    *                 type: number
//    *                 description: Final payable amount
//    *                 example: 499
//    *
//    *               customerId:
//    *                 type: integer
//    *                 description: Logged in user id
//    *                 example: 1
//    *
//    *               email:
//    *                 type: string
//    *                 example: "user@gmail.com"
//    *
//    *               mobile:
//    *                 type: string
//    *                 example: "9876543210"
//    *
//    *               service_code:
//    *                 type: string
//    *                 example: "AC10001"
//    *
//    *               subservice_code:
//    *                 type: string
//    *                 example: "AC10001-01"
//    *
//    *               address:
//    *                 type: string
//    *                 example: "123 Main Street"
//    *
//    *               date:
//    *                 type: string
//    *                 format: date
//    *                 example: "2026-01-10"
//    *
//    *               time_slot:
//    *                 type: string
//    *                 example: "10:00-11:00"
//    *
//    *               gst:
//    *                 type: number
//    *                 example: 18
//    *
//    *               emergency_price:
//    *                 type: number
//    *                 example: 100
//    *
//    *               quantity:
//    *                 type: integer
//    *                 example: 2
//    *
//    *     responses:
//    *       200:
//    *         description: Payment initiated successfully
//    *         content:
//    *           application/json:
//    *             schema:
//    *               type: object
//    *
//    *               properties:
//    *
//    *                 success:
//    *                   type: boolean
//    *                   example: true
//    *
//    *                 orderId:
//    *                   type: string
//    *                   example: "BD100027"
//    *
//    *                 juspay_id:
//    *                   type: string
//    *                   example: "ordeh_abc123"
//    *
//    *                 status:
//    *                   type: string
//    *                   example: "CREATED"
//    *
//    *                 payment_urls:
//    *                   type: object
//    *                   properties:
//    *
//    *                     web:
//    *                       type: string
//    *                       example: "https://smartgateway..."
//    *
//    *                     mobile:
//    *                       type: string
//    *                       example: "https://smartgateway..."
//    *
//    *                     iframe:
//    *                       type: string
//    *                       example: "https://smartgateway..."
//    *
//    *       400:
//    *         description: Missing required fields
//    *
//    *       500:
//    *         description: Payment init failed
//    */


//   router.post("/initiate", async (req, res) => {
//     try {
//       const {
//         amount,
//         customerId,
//         email,
//         mobile,
//         service_code,
//         subservice_code,
//         address,
//         date,
//         time_slot,
//         gst,
//         emergency_price,
//         quantity,
//       } = req.body;

//       if (!amount || !customerId || !subservice_code || !quantity) {
//         return res.status(400).json({
//           success: false,
//           message: "Missing required fields",
//         });
//       }

//       // ===================================================
//       // ✅ SAME COD ORDER ID LOGIC - SINGLE SOURCE
//       // ===================================================
//       const lastBooking = await db.ServiceOnBooking.findOne({
//         order: [["id", "DESC"]],
//       });

//       let order_id = "BD100001";

//       if (lastBooking) {
//         const lastNumber = parseInt(lastBooking.order_id.replace("BD", ""));
//         order_id = `BD${lastNumber + 1}`;
//       }

//       // ===================================================
//       // 1️⃣ CREATE BOOKING FIRST (ONLINE MODE)
//       // ===================================================
//         const booking = await db.ServiceOnBooking.create({
//           order_id,
//           user_id: customerId,
//           service_code,
//           subservice_code,
//           address,
//           date,
//           time_slot,
//           gst,
//           emergency_price: emergency_price || 0,
//           quantity,
//           total_price: amount,
//           payment_method: "ONLINE",
//           payment_status: "INITIATED",
//         });

//       // ===================================================
//       // 2️⃣ CREATE PAYMENT ENTRY (FK → booking.id)
//       // ===================================================
//       // await db.Payment.create({
//       //   order_id: booking.id,
//       //   amount,
//       //   customer_id: customerId,
//       //   initiated_at: new Date(),
//       // });

//       await db.Payment.create({
//         booking_id: booking.id,
//         order_code: order_id, // BD100025
//         amount,
//         customer_id: customerId,
//         initiated_at: new Date(),
//       });


//       // ===================================================
//       // 3️⃣ JUSPAY CALL
//       // ===================================================
//       // const amountInPaise = Math.round(Number(amount) * 100); // added 
//       // const juspayResponse = await juspay.order.create({
//       //   order_id: order_id, // BD100025
//       //   // amount: amount * 100,
//       //   amount: amountInPaise, //added
//       //   currency: "INR",
//       //   customer_id: String(customerId),
//       //   customer_email: email,
//       //   customer_phone: mobile,
//       //   return_url: `${process.env.BASE_URL}/api/payment/juspay/verify?order_id=${order_id}`,
//       // });

//       const juspayResponse = await juspay.order.create({
//         order_id: order_id, // BD100005
//         amount: Number(amount).toFixed(2), // ✅ RUPEES, not paise
//         currency: "INR",
//         customer_id: String(customerId),
//         customer_email: email,
//         customer_phone: mobile,
//         // return_url: `${process.env.BASE_URL}/api/payment/juspay/verify?order_id=${order_id}`,
//         // return_url: `${process.env.BASE_URL}/payment/juspay/verify?order_id=${order_id}`,
//         return_url: `${process.env.BASE_URL}/api/payment/juspay/redirect?order_id=${order_id}`,
//       });

//       // ===================================================
//       // 4️⃣ CLEAN RESPONSE
//       // ===================================================
//       return res.status(200).json({
//         success: true,
//         orderId: order_id,
//         juspay_id: juspayResponse.id,
//         status: juspayResponse.status,

//         payment_urls: {
//           web: juspayResponse.payment_links?.web || null,
//           mobile: juspayResponse.payment_links?.mobile || null,
//           iframe: juspayResponse.payment_links?.iframe || null,
//         },
//       });
//     } catch (err) {
//       console.error("PAYMENT INIT ERROR →", err);
//       res.status(500).json({
//         success: false,
//         message: "Payment init failed",
//       });
//     }
//   });










//   /**
//  * @swagger
//  * /api/payment/juspay/verify:
//  *   get:
//  *     summary: Juspay payment verification redirect
//  *     tags:
//  *       - Payment
//  */
// router.all("/verify", async (req, res) => {
//   try {
//     console.log("VERIFY HIT");
//     console.log("QUERY →", req.query);
//     console.log("BODY →", req.body);

//     const orderId =
//       req.query.order_id ||
//       req.body.order_id ||
//       req.body.orderId ||
//       req.body?.order?.order_id;

//     if (!orderId) {
//       return res.status(400).send("Order ID missing");
//     }

//     const status = await juspay.order.status(orderId);

//     if (status.status === "CHARGED") {
//       await db.Payment.update(
//         { status: "SUCCESS" },
//         { where: { order_code: orderId } }
//       );

//       await db.ServiceOnBooking.update(
//         { payment_status: "PAID" },
//         { where: { order_id: orderId } }
//       );

//       return res.redirect(
//         `https://bhsfrontend.vercel.app/payment-success?order_id=${orderId}`
//       );
//     }

//     await db.Payment.update(
//       { status: "FAILED" },
//       { where: { order_code: orderId } }
//     );

//     await db.ServiceOnBooking.update(
//       { payment_status: "FAILED" },
//       { where: { order_id: orderId } }
//     );

//     return res.redirect(
//       `https://bhsfrontend.vercel.app/payment-failed?order_id=${orderId}`
//     );
//   } catch (err) {
//     console.error("VERIFY ERROR →", err);
//     return res.redirect("https://bhsfrontend.vercel.app/payment-failed");
//   }
// });















// // /**
// //  * @swagger
// //  * /api/payment/juspay/response:
// //  *   get:
// //  *     summary: Juspay payment redirect
// //  *     tags:
// //  *       - Payment
// //  *   post:
// //  *     summary: Juspay payment webhook
// //  *     tags:
// //  *       - Payment
// //  */
// // router.all("/response", async (req, res) => {
// //   const orderId = req.body.order_id || req.query.order_id || req.body.orderId;

// //   if (!orderId) {
// //     return res.status(400).send("Order ID missing");
// //   }

// //   const status = await juspay.order.status(orderId);

// //   if (status.status === "CHARGED") {
// //     return res.redirect("https://bhsfrontend.vercel.app/payment-success");
// //   }
// //   return res.redirect("https://bhsfrontend.vercel.app/payment-failed");
// // });

// module.exports = router;



























































/// deployed 2nd stage ////
///// currently working both bookingID and the wallet recharge ////

// const express = require("express");
// const db = require("../models");
// const router = express.Router();
// const juspay = require("./juspay");

// /**
//  * @swagger
//  * /payment/juspay/initiate:
//  *   post:
//  *     summary: Create service booking & initiate online payment
//  *     description: |
//  *       Creates a booking with ONLINE payment and initiates Juspay order.
//  *     tags:
//  *       - Payment
//  *     requestBody:
//  *       required: true
//  *       content:
//  *         application/json:
//  *           schema:
//  *             type: object
//  *             required:
//  *               - amount
//  *               - customerId
//  *               - subservice_code
//  *               - quantity
//  *             properties:
//  *               amount:
//  *                 type: number
//  *                 example: 499
//  *               customerId:
//  *                 type: integer
//  *                 example: 23
//  *               email:
//  *                 type: string
//  *                 example: test@gmail.com
//  *               mobile:
//  *                 type: string
//  *                 example: "9999999999"
//  *               service_code:
//  *                 type: string
//  *                 example: SRV001
//  *               subservice_code:
//  *                 type: string
//  *                 example: SUB001
//  *               address:
//  *                 type: string
//  *                 example: Bhubaneswar
//  *               date:
//  *                 type: string
//  *                 example: 2026-02-05
//  *               time_slot:
//  *                 type: string
//  *                 example: 10:00 AM - 11:00 AM
//  *               gst:
//  *                 type: number
//  *                 example: 18
//  *               emergency_price:
//  *                 type: number
//  *                 example: 0
//  *               quantity:
//  *                 type: integer
//  *                 example: 1
//  *     responses:
//  *       200:
//  *         description: Juspay payment initiated
//  *       400:
//  *         description: Missing required fields
//  *       500:
//  *         description: Payment initiation failed
//  */

// router.post("/initiate", async (req, res) => {
//   try {
//     const {
//       amount,
//       customerId,
//       email,
//       mobile,
//       service_code,
//       subservice_code,
//       address,
//       date,
//       time_slot,
//       gst,
//       emergency_price,
//       quantity,
//     } = req.body;

//     if (!amount || !customerId || !subservice_code || !quantity) {
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//       });
//     }

//     // ===================================================
//     // ORDER ID LOGIC
//     // ===================================================
//     const lastBooking = await db.ServiceOnBooking.findOne({
//       order: [["id", "DESC"]],
//     });

//     let order_id = "BD100001";
//     if (lastBooking) {
//       const lastNumber = parseInt(lastBooking.order_id.replace("BD", ""));
//       order_id = `BD${lastNumber + 1}`;
//     }

//     // ===================================================
//     // CREATE BOOKING
//     // ===================================================
//     const booking = await db.ServiceOnBooking.create({
//       order_id,
//       user_id: customerId,
//       service_code,
//       subservice_code,
//       address,
//       date,
//       time_slot,
//       gst,
//       emergency_price: emergency_price || 0,
//       quantity,
//       total_price: amount,
//       payment_method: "ONLINE",
//       payment_status: "INITIATED",
//     });

//     // ===================================================
//     // CREATE PAYMENT ENTRY
//     // ===================================================
//     await db.Payment.create({
//       booking_id: booking.id,
//       order_code: order_id,
//       amount,
//       customer_id: customerId,
//       initiated_at: new Date(),
//       status: "INITIATED",
//     });

//     // ===================================================
//     // INITIATE JUSPAY PAYMENT
//     // ===================================================
//     const juspayResponse = await juspay.order.create({
//       order_id: order_id,
//       amount: Number(amount).toFixed(2),
//       currency: "INR",
//       customer_id: String(customerId),
//       customer_email: email,
//       customer_phone: mobile,
//       // Browser redirect URL for after payment
//       // return_url: `${process.env.BASE_URL}/api/payment/juspay/redirect?order_id=${order_id}`,
//       return_url: `${process.env.BASE_URL}/api/payment/juspay/redirect`,
//     });

//     // ===================================================
//     // RESPONSE TO FRONTEND
//     // ===================================================
//     return res.status(200).json({
//       success: true,
//       orderId: order_id,
//       juspay_id: juspayResponse.id,
//       status: juspayResponse.status,
//       payment_urls: {
//         web: juspayResponse.payment_links?.web || null,
//         mobile: juspayResponse.payment_links?.mobile || null,
//         iframe: juspayResponse.payment_links?.iframe || null,
//       },
//     });
//   } catch (err) {
//     console.error("PAYMENT INIT ERROR →", err);
//     return res.status(500).json({
//       success: false,
//       message: "Payment init failed",
//     });
//   }
// });










// // /**
// //  * JUSPAY WEBHOOK (POST)
// //  * Server → server callback from Juspay
// //  */
// // router.post("/webhook", async (req, res) => {
// //   try {
// //     console.log("JUSPAY WEBHOOK BODY:", req.body);

// //     const orderId =
// //       req.body.order_id || req.body.orderId || req.body.merchant_order_id;

// //     if (!orderId) return res.sendStatus(200);

// //     const status = await juspay.order.status(orderId);

// //     if (status.status === "CHARGED") {
// //       // Update payment only if not already SUCCESS
// //       const payment = await db.Payment.findOne({
// //         where: { order_code: orderId },
// //       });
// //       if (payment && payment.status !== "SUCCESS") {
// //         await db.Payment.update(
// //           { status: "SUCCESS" },
// //           { where: { order_code: orderId } }
// //         );

// //         await db.ServiceOnBooking.update(
// //           { payment_status: "PAID" },
// //           { where: { order_id: orderId } }
// //         );
// //       }
// //     } else if (status.status === "FAILED") {
// //       await db.Payment.update(
// //         { status: "FAILED" },
// //         { where: { order_code: orderId } }
// //       );

// //       await db.ServiceOnBooking.update(
// //         { payment_status: "FAILED" },
// //         { where: { order_id: orderId } }
// //       );
// //     }

// //     return res.sendStatus(200);
// //   } catch (err) {
// //     console.error("WEBHOOK ERROR →", err);
// //     return res.sendStatus(500);
// //   }
// // });






// /**
//  * JUSPAY WEBHOOK (POST)
//  * Handles BOTH:
//  * 1. Service Booking Payments (BDxxxx)
//  * 2. Wallet Top-ups (WLxxxx)
//  */
// router.post("/webhook", async (req, res) => {
//   try {
//     console.log("JUSPAY WEBHOOK BODY:", req.body);

//     const orderId =
//       req.body.order_id || req.body.orderId || req.body.merchant_order_id;

//     if (!orderId) return res.sendStatus(200);

//     const statusResp = await juspay.order.status(orderId);

//     /* =======================
//        BOOKING PAYMENT (UNCHANGED)
//     ======================= */
//     if (orderId.startsWith("BD")) {
//       if (statusResp.status === "CHARGED") {
//         const payment = await db.Payment.findOne({
//           where: { order_code: orderId },
//         });

//         if (payment && payment.status !== "SUCCESS") {
//           await db.Payment.update(
//             { status: "SUCCESS" },
//             { where: { order_code: orderId } }
//           );

//           await db.ServiceOnBooking.update(
//             { payment_status: "PAID" },
//             { where: { order_id: orderId } }
//           );
//         }
//       } else if (statusResp.status === "FAILED") {
//         await db.Payment.update(
//           { status: "FAILED" },
//           { where: { order_code: orderId } }
//         );

//         await db.ServiceOnBooking.update(
//           { payment_status: "FAILED" },
//           { where: { order_id: orderId } }
//         );
//       }
//     }

//     /* =======================
//        WALLET TOP-UP (NEW)
//     ======================= */
//     if (orderId.startsWith("WL")) {
//       const txn = await db.WalletTransaction.findOne({
//         where: { order_id: orderId },
//       });

//       // Safety: already processed
//       if (!txn || txn.status === "SUCCESS") {
//         return res.sendStatus(200);
//       }

//       if (statusResp.status === "CHARGED") {
//         const wallet = await db.TechnicianWallet.findByPk(txn.wallet_id);

//         await wallet.update({
//           balance: Number(wallet.balance) + Number(txn.amount),
//         });

//         await txn.update({ status: "SUCCESS" });
//       } else if (statusResp.status === "FAILED") {
//         await txn.update({ status: "FAILED" });
//       }
//     }

//     return res.sendStatus(200);
//   } catch (err) {
//     console.error("WEBHOOK ERROR →", err);
//     return res.sendStatus(500);
//   }
// });












// /**
//  * BROWSER REDIRECT (GET)
//  * Redirect user to Thank You page with orderId
//  */
// // router.get("/redirect", async (req, res) => {
// //   const { order_id } = req.query;

// //   if (!order_id) {
// //     return res.redirect("https://bhsfrontend.vercel.app/payment-failed");
// //   }

// //   try {
// //     const payment = await db.Payment.findOne({
// //       where: { order_code: order_id },
// //     });

// //     if (payment?.status === "SUCCESS") {
// //       // ✅ Redirect to Thank You page with orderId
// //       return res.redirect(
// //         `https://bhsfrontend.vercel.app/thank-you?order_id=${order_id}`
// //       );
// //     }

// //     // If payment failed or not found
// //     return res.redirect(
// //       `https://bhsfrontend.vercel.app/payment-failed?order_id=${order_id}`
// //     );
// //   } catch (err) {
// //     console.error("REDIRECT ERROR →", err);
// //     return res.redirect("https://bhsfrontend.vercel.app/payment-failed");
// //   }
// // });



// /**
//  * BROWSER REDIRECT (GET + POST)
//  * Juspay redirects user after payment
//  */
// // router.all("/redirect", async (req, res) => {
// //   try {
// //     console.log("REDIRECT HIT");
// //     console.log("METHOD:", req.method);
// //     console.log("QUERY:", req.query);
// //     console.log("BODY:", req.body);

// //     const order_id =
// //       req.query.order_id ||
// //       req.body.order_id ||
// //       req.body.merchant_order_id;

// //     if (!order_id) {
// //       console.log("No Order ID Found");
// //       return res.redirect("http://localhost:3000/payment-failed");
// //     }

// //     console.log("Order ID:", order_id);

// //     // Check booking payment
// //     const payment = await db.Payment.findOne({
// //       where: { order_code: order_id },
// //     });

// //     console.log("Payment Record:", payment?.status);

// //     if (payment && payment.status === "SUCCESS") {
// //       console.log("Payment SUCCESS");

// //       return res.redirect(
// //         `http://localhost:3000/thank-you?order_id=${order_id}`
// //       );
// //     }

// //     console.log("Payment NOT SUCCESS");

// //     return res.redirect(
// //       `http://localhost:3000/payment-failed?order_id=${order_id}`
// //     );
// //   } catch (err) {
// //     console.error("REDIRECT ERROR:", err);

// //     return res.redirect(
// //       "http://localhost:3000/payment-failed"
// //     );
// //   }
// // });







// router.all("/redirect", async (req, res) => {
//   try {
//     console.log("========== REDIRECT HIT ==========");
//     console.log("METHOD:", req.method);
//     console.log("QUERY:", req.query);
//     console.log("BODY:", req.body);
//     console.log("==================================");

//     const order_id =
//       req.query.order_id ||
//       req.body.order_id ||
//       req.body.orderId ||
//       req.body.merchant_order_id;

//     if (!order_id) {
//       console.log("❌ No order_id received");
//       return res.redirect("http://localhost:3000/payment-failed");
//     }

//     console.log("Order ID:", order_id);

//     const payment = await db.Payment.findOne({
//       where: { order_code: order_id },
//     });

//     console.log("Payment Status:", payment?.status);

//     if (payment?.status === "SUCCESS") {
//       return res.redirect(
//         `http://localhost:3000/thank-you?order_id=${order_id}`
//       );
//     }

//     return res.redirect(
//       `http://localhost:3000/payment-failed?order_id=${order_id}`
//     );
//   } catch (err) {
//     console.error("REDIRECT ERROR:", err);
//     return res.redirect("http://localhost:3000/payment-failed");
//   }
// });



// module.exports = router;




























































/////// tested 3rd stage /////


const express = require("express");
const db = require("../models");
const router = express.Router();
const juspay = require("./juspay");

/**
 * @swagger
 * /payment/juspay/initiate:
 *   post:
 *     summary: Create service booking & initiate online payment
 *     description: |
 *       Creates a booking with ONLINE payment and initiates Juspay order.
 *     tags:
 *       - Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - customerId
 *               - subservice_code
 *               - quantity
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 499
 *               customerId:
 *                 type: integer
 *                 example: 23
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               mobile:
 *                 type: string
 *                 example: "9999999999"
 *               service_code:
 *                 type: string
 *                 example: SRV001
 *               subservice_code:
 *                 type: string
 *                 example: SUB001
 *               address:
 *                 type: string
 *                 example: Bhubaneswar
 *               date:
 *                 type: string
 *                 example: 2026-02-05
 *               time_slot:
 *                 type: string
 *                 example: 10:00 AM - 11:00 AM
 *               gst:
 *                 type: number
 *                 example: 18
 *               emergency_price:
 *                 type: number
 *                 example: 0
 *               quantity:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Juspay payment initiated
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Payment initiation failed
 */

// router.post("/initiate", async (req, res) => {
//   try {
//     console.log("=========== INITIATE START ===========");
//     console.log("Request Body:", req.body);

//     const {
//       amount,
//       customerId,
//       email,
//       mobile,
//       service_code,
//       subservice_code,
//       address,
//       date,
//       time_slot,
//       gst,
//       emergency_price,
//       quantity,
//     } = req.body;

//     if (!amount || !customerId || !subservice_code || !quantity) {
//       console.log("❌ Missing required fields");
//       return res.status(400).json({
//         success: false,
//         message: "Missing required fields",
//       });
//     }

//     console.log("✔ Fields validated");

//     // ===================================================
//     // ORDER ID LOGIC
//     // ===================================================
//     const lastBooking = await db.ServiceOnBooking.findOne({
//       order: [["id", "DESC"]],
//     });

//     let order_id = "BD100001";
//     if (lastBooking) {
//       const lastNumber = parseInt(lastBooking.order_id.replace("BD", ""));
//       order_id = `BD${lastNumber + 1}`;
//     }

//     console.log("Generated Order ID:", order_id);

//     // ===================================================
//     // CREATE BOOKING
//     // ===================================================
//     const booking = await db.ServiceOnBooking.create({
//       order_id,
//       user_id: customerId,
//       service_code,
//       subservice_code,
//       address,
//       date,
//       time_slot,
//       gst,
//       emergency_price: emergency_price || 0,
//       quantity,
//       total_price: amount,
//       payment_method: "ONLINE",
//       payment_status: "INITIATED",
//     });

//     console.log("✔ Booking Created:", booking.id);

//     // ===================================================
//     // CREATE PAYMENT ENTRY
//     // ===================================================
//     await db.Payment.create({
//       booking_id: booking.id,
//       order_code: order_id,
//       amount,
//       customer_id: customerId,
//       initiated_at: new Date(),
//       status: "INITIATED",
//     });

//     console.log("✔ Payment Record Created");

//     // ===================================================
//     // INITIATE JUSPAY PAYMENT
//     // ===================================================
//     console.log("Creating Juspay Order...");

//     console.log("Using BASE_URL:", BASE_URL);

//     const juspayResponse = await juspay.order.create({
//       order_id: order_id,
//       amount: Number(amount).toFixed(2),
//       currency: "INR",
//       customer_id: String(customerId),
//       customer_email: email,
//       customer_phone: mobile,
//       return_url: `${process.env.BASE_URL}/api/payment/juspay/redirect`,
//     });

//     console.log("✔ Juspay Order Created");
//     console.log("Juspay ID:", juspayResponse.id);
//     console.log("Juspay Status:", juspayResponse.status);
//     console.log("Payment URL:", juspayResponse.payment_links?.web);

//     console.log("=========== INITIATE END ===========");

//     return res.status(200).json({
//       success: true,
//       orderId: order_id,
//       juspay_id: juspayResponse.id,
//       status: juspayResponse.status,
//       payment_urls: {
//         web: juspayResponse.payment_links?.web || null,
//         mobile: juspayResponse.payment_links?.mobile || null,
//         iframe: juspayResponse.payment_links?.iframe || null,
//       },
//     });
//   } catch (err) {
//     console.error("❌ PAYMENT INIT ERROR →", err);
//     return res.status(500).json({
//       success: false,
//       message: "Payment init failed",
//     });
//   }
// });




router.post("/initiate", async (req, res) => {
  try {
    console.log("\n=========== INITIATE START ===========");
    console.log("Request Body:", req.body);

    const {
      amount,
      customerId,
      email,
      mobile,
      service_code,
      subservice_code,
      address,
      date,
      time_slot,
      gst,
      emergency_price,
      quantity,
    } = req.body;

    if (!amount || !customerId || !subservice_code || !quantity) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    console.log("✔ Fields validated");

    // ===================================================
    // BASE URL FIX
    // ===================================================
    const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

    console.log("BASE_URL:", BASE_URL);
    console.log("ENV BASE_URL:", process.env.BASE_URL);

    // ===================================================
    // UNIQUE ORDER ID FIX (Prevents expired session)
    // ===================================================
    const order_id = `BD${Date.now()}`;

    console.log("Generated Order ID:", order_id);

    // ===================================================
    // CREATE BOOKING
    // ===================================================
    console.log("Creating booking...");

    const booking = await db.ServiceOnBooking.create({
      order_id,
      user_id: customerId,
      service_code,
      subservice_code,
      address,
      date,
      time_slot,
      gst,
      emergency_price: emergency_price || 0,
      quantity,
      total_price: amount,
      payment_method: "ONLINE",
      payment_status: "INITIATED",
    });

    console.log("✔ Booking Created:", booking.id);

    // ===================================================
    // CREATE PAYMENT ENTRY
    // ===================================================
    console.log("Creating payment record...");

    await db.Payment.create({
      booking_id: booking.id,
      order_code: order_id,
      amount,
      customer_id: customerId,
      initiated_at: new Date(),
      status: "INITIATED",
    });

    console.log("✔ Payment Record Created");

    // ===================================================
    // INITIATE JUSPAY PAYMENT
    // ===================================================
    console.log("Creating Juspay Order...");

    const returnUrl = `${BASE_URL}/api/payment/juspay/redirect`;

    console.log("Return URL:", returnUrl);

    const juspayResponse = await juspay.order.create({
      order_id: order_id,
      amount: Number(amount).toFixed(2),
      currency: "INR",
      customer_id: String(customerId),
      customer_email: email,
      customer_phone: mobile,
      return_url: returnUrl,
    });

    console.log("✔ Juspay Order Created");
    console.log("Juspay ID:", juspayResponse.id);
    console.log("Juspay Status:", juspayResponse.status);
    console.log("Payment URL:", juspayResponse.payment_links?.web);
    console.log("Expiry:", juspayResponse.order_expiry);

    console.log("=========== INITIATE END ===========\n");

    return res.status(200).json({
      success: true,
      orderId: order_id,
      juspay_id: juspayResponse.id,
      status: juspayResponse.status,
      payment_urls: {
        web: juspayResponse.payment_links?.web || null,
        mobile: juspayResponse.payment_links?.mobile || null,
        iframe: juspayResponse.payment_links?.iframe || null,
      },
    });
  } catch (err) {
    console.error("❌ PAYMENT INIT ERROR →", err);
    return res.status(500).json({
      success: false,
      message: "Payment init failed",
    });
  }
});



// /**
//  * JUSPAY WEBHOOK (POST)
//  * Server → server callback from Juspay
//  */
router.post("/webhook", async (req, res) => {
  try {
    console.log("=========== WEBHOOK START ===========");
    console.log("Webhook Body:", req.body);

    const orderId =
      req.body.order_id || req.body.orderId || req.body.merchant_order_id;

    console.log("Order ID from webhook:", orderId);

    if (!orderId) {
      console.log("❌ No Order ID");
      return res.sendStatus(200);
    }

    const statusResp = await juspay.order.status(orderId);

    console.log("Juspay Status:", statusResp.status);

    if (orderId.startsWith("BD")) {
      console.log("Booking Payment Detected");

      if (statusResp.status === "CHARGED") {
        console.log("Payment CHARGED");

        const payment = await db.Payment.findOne({
          where: { order_code: orderId },
        });

        console.log("Payment Record:", payment?.status);

        if (payment && payment.status !== "SUCCESS") {
          await db.Payment.update(
            { status: "SUCCESS" },
            { where: { order_code: orderId } }
          );

          await db.ServiceOnBooking.update(
            { payment_status: "PAID" },
            { where: { order_id: orderId } }
          );

          console.log("✔ Payment Updated SUCCESS");
        }
      } else if (statusResp.status === "FAILED") {
        console.log("Payment FAILED");

        await db.Payment.update(
          { status: "FAILED" },
          { where: { order_code: orderId } }
        );
      }
    }

    console.log("=========== WEBHOOK END ===========");

    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ WEBHOOK ERROR →", err);
    return res.sendStatus(500);
  }
});

/**
 * BROWSER REDIRECT (GET)
 * Redirect user to Thank You page with orderId
 */
// router.all("/redirect", async (req, res) => {
//   try {
//     console.log("=========== REDIRECT START ===========");
//     console.log("Method:", req.method);
//     console.log("Query:", req.query);
//     console.log("Body:", req.body);

//     const order_id =
//       req.query.order_id ||
//       req.body.order_id ||
//       req.body.orderId ||
//       req.body.merchant_order_id;

//     console.log("Received Order ID:", order_id);

//     if (!order_id) {
//       console.log("❌ No Order ID in redirect");
//       return res.redirect("http://localhost:3000/payment-failed");
//     }

//     const payment = await db.Payment.findOne({
//       where: { order_code: order_id },
//     });

//     console.log("Payment Record:", payment);

//     if (payment?.status === "SUCCESS") {
//       console.log("✔ Redirecting to SUCCESS");

//       return res.redirect(
//         `http://localhost:3000/thank-you?order_id=${order_id}`
//       );
//     }

//     console.log("❌ Redirecting to FAILED");

//     return res.redirect(
//       `http://localhost:3000/payment-failed?order_id=${order_id}`
//     );
//   } catch (err) {
//     console.error("❌ REDIRECT ERROR:", err);

//     return res.redirect("http://localhost:3000/payment-failed");
//   }
// });



////////// fixed version /////
// router.all("/redirect", async (req, res) => {
//   try {
//     console.log("\n=========== REDIRECT START ===========");
//     console.log("Method:", req.method);
//     console.log("Query:", req.query);
//     console.log("Body:", req.body);

//     const order_id =
//       req.query.order_id || req.body.order_id || req.body.merchant_order_id;

//     const paymentStatus = req.body.status || req.query.status;

//     console.log("Received Order ID:", order_id);
//     console.log("Payment Status From Juspay:", paymentStatus);

//     if (!order_id) {
//       console.log("❌ No Order ID");
//       return res.redirect("http://localhost:3000/payment-failed");
//     }

//     const payment = await db.Payment.findOne({
//       where: { order_code: order_id },
//     });

//     console.log("DB Payment Status:", payment?.status);

//     // ✅ UPDATE STATUS IF CHARGED
//     if (paymentStatus === "CHARGED") {
//       console.log("Updating payment to SUCCESS...");

//       await db.Payment.update(
//         { status: "SUCCESS" },
//         { where: { order_code: order_id } }
//       );

//       await db.ServiceOnBooking.update(
//         { payment_status: "PAID" },
//         { where: { order_id: order_id } }
//       );

//       console.log("✔ Payment Updated SUCCESS");

//       return res.redirect(
//         `http://localhost:3000/thank-you?order_id=${order_id}`
//       );
//     }

//     console.log("❌ Payment Failed");

//     await db.Payment.update(
//       { status: "FAILED" },
//       { where: { order_code: order_id } }
//     );

//     return res.redirect(
//       `http://localhost:3000/payment-failed?order_id=${order_id}`
//     );
//   } catch (err) {
//     console.error("REDIRECT ERROR:", err);

//     return res.redirect("http://localhost:3000/payment-failed");
//   }
// });






router.all("/redirect", async (req, res) => {
  try {
    console.log("\n=========== REDIRECT START ===========");
    console.log("Method:", req.method);
    console.log("Query:", req.query);
    console.log("Body:", req.body);

    const order_id = req.body.order_id || req.query.order_id;

    const paymentStatus = req.body.status || req.query.status;

    console.log("Received Order ID:", order_id);
    console.log("Payment Status:", paymentStatus);

    const payment = await db.Payment.findOne({
      where: { order_code: order_id },
    });

    console.log("DB Payment Status:", payment?.status);

    if (paymentStatus === "CHARGED") {
      console.log("Updating payment SUCCESS...");

      await db.Payment.update(
        { status: "SUCCESS" },
        { where: { order_code: order_id } }
      );

      await db.ServiceOnBooking.update(
        { payment_status: "PAID" },
        { where: { order_id: order_id } }
      );

      console.log("✔ Payment SUCCESS");
      console.log("✔ Booking PAID");

      return res.redirect(
        `http://localhost:3000/thank-you?order_id=${order_id}`
      );
    }

    console.log("❌ Payment FAILED");

    await db.Payment.update(
      { status: "FAILED" },
      { where: { order_code: order_id } }
    );

    return res.redirect(
      `http://localhost:3000/payment-failed?order_id=${order_id}`
    );
  } catch (err) {
    console.error("REDIRECT ERROR:", err);

    return res.redirect("http://localhost:3000/payment-failed");
  }
});



module.exports = router;
