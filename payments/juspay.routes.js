const express = require("express");
const db = require("../models");
const router = express.Router();
const juspay = require("./juspay");
const config = require("../keys/juspay_config.json");
const generateOrderId = require("../src/utils/generateOrderId");

/**
 * @swagger
 * /payment/juspay/initiate:
 *   post:
 *     summary: Create service booking + initiate Juspay payment
 *     description: |
 *       This API will:
 *       1. Generate BD order id from ServiceOnBooking sequence  
 *       2. Create booking record with payment_method = ONLINE  
 *       3. Create payment entry  
 *       4. Initiate Juspay transaction  
 *       5. Return only required payment URLs
 *
 *     tags:
 *       - Payment
 *
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *
 *             required:
 *               - amount
 *               - customerId
 *               - service_code
 *               - subservice_code
 *               - address
 *               - date
 *               - time_slot
 *               - quantity
 *
 *             properties:
 *
 *               amount:
 *                 type: number
 *                 description: Final payable amount
 *                 example: 499
 *
 *               customerId:
 *                 type: integer
 *                 description: Logged in user id
 *                 example: 1
 *
 *               email:
 *                 type: string
 *                 example: "user@gmail.com"
 *
 *               mobile:
 *                 type: string
 *                 example: "9876543210"
 *
 *               service_code:
 *                 type: string
 *                 example: "AC10001"
 *
 *               subservice_code:
 *                 type: string
 *                 example: "AC10001-01"
 *
 *               address:
 *                 type: string
 *                 example: "123 Main Street"
 *
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-10"
 *
 *               time_slot:
 *                 type: string
 *                 example: "10:00-11:00"
 *
 *               gst:
 *                 type: number
 *                 example: 18
 *
 *               emergency_price:
 *                 type: number
 *                 example: 100
 *
 *               quantity:
 *                 type: integer
 *                 example: 2
 *
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *
 *               properties:
 *
 *                 success:
 *                   type: boolean
 *                   example: true
 *
 *                 orderId:
 *                   type: string
 *                   example: "BD100027"
 *
 *                 juspay_id:
 *                   type: string
 *                   example: "ordeh_abc123"
 *
 *                 status:
 *                   type: string
 *                   example: "CREATED"
 *
 *                 payment_urls:
 *                   type: object
 *                   properties:
 *
 *                     web:
 *                       type: string
 *                       example: "https://smartgateway..."
 *
 *                     mobile:
 *                       type: string
 *                       example: "https://smartgateway..."
 *
 *                     iframe:
 *                       type: string
 *                       example: "https://smartgateway..."
 *
 *       400:
 *         description: Missing required fields
 *
 *       500:
 *         description: Payment init failed
 */


router.post("/initiate", async (req, res) => {
  try {
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
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // ===================================================
    // ✅ SAME COD ORDER ID LOGIC - SINGLE SOURCE
    // ===================================================
    const lastBooking = await db.ServiceOnBooking.findOne({
      order: [["id", "DESC"]],
    });

    let order_id = "BD100001";

    if (lastBooking) {
      const lastNumber = parseInt(lastBooking.order_id.replace("BD", ""));
      order_id = `BD${lastNumber + 1}`;
    }

    // ===================================================
    // 1️⃣ CREATE BOOKING FIRST (ONLINE MODE)
    // ===================================================
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

    // ===================================================
    // 2️⃣ CREATE PAYMENT ENTRY (FK → booking.id)
    // ===================================================
    // await db.Payment.create({
    //   order_id: booking.id,
    //   amount,
    //   customer_id: customerId,
    //   initiated_at: new Date(),
    // });

    await db.Payment.create({
      booking_id: booking.id,
      order_code: order_id, // BD100025
      amount,
      customer_id: customerId,
      initiated_at: new Date(),
    });


    // ===================================================
    // 3️⃣ JUSPAY CALL
    // ===================================================
    // const amountInPaise = Math.round(Number(amount) * 100); // added 
    // const juspayResponse = await juspay.order.create({
    //   order_id: order_id, // BD100025
    //   // amount: amount * 100,
    //   amount: amountInPaise, //added
    //   currency: "INR",
    //   customer_id: String(customerId),
    //   customer_email: email,
    //   customer_phone: mobile,
    //   return_url: `${process.env.BASE_URL}/api/payment/juspay/verify?order_id=${order_id}`,
    // });

    const juspayResponse = await juspay.order.create({
      order_id: order_id, // BD100005
      amount: Number(amount).toFixed(2), // ✅ RUPEES, not paise
      currency: "INR",
      customer_id: String(customerId),
      customer_email: email,
      customer_phone: mobile,
      return_url: `${process.env.BASE_URL}/api/payment/juspay/verify?order_id=${order_id}`,
    });

    // ===================================================
    // 4️⃣ CLEAN RESPONSE
    // ===================================================
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
    console.error("PAYMENT INIT ERROR →", err);
    res.status(500).json({
      success: false,
      message: "Payment init failed",
    });
  }
});




/**
 * @swagger
 * /api/payment/juspay/response:
 *   get:
 *     summary: Juspay payment redirect
 *     tags:
 *       - Payment
 *   post:
 *     summary: Juspay payment webhook
 *     tags:
 *       - Payment
 */
router.all("/response", async (req, res) => {
  const orderId = req.body.order_id || req.query.order_id || req.body.orderId;

  if (!orderId) {
    return res.status(400).send("Order ID missing");
  }

  const status = await juspay.order.status(orderId);

  if (status.status === "CHARGED") {
    return res.redirect("https://bhsfrontend.vercel.app/payment-success");
  }
  return res.redirect("https://bhsfrontend.vercel.app/payment-failed");
});

module.exports = router;
