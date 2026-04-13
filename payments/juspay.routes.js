const express = require("express");
const db = require("../models");
const router = express.Router();
const juspay = require("./juspay");

/**
 * @swagger
 * /payment/juspay/initiate:
 *   post:
 *     summary: Create service booking & initiate Juspay payment (Frontend Calculated)
 *     description: |
 *       This API creates bookings and initiates Juspay payment.
 *       ⚠️ All pricing (GST, total_price, emergency_price) MUST be calculated in frontend.
 *       Backend will NOT recalculate anything.
 *     tags:
 *       - Payment
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - customerId
 *               - services
 *               - total_amount
 *             properties:
 *               customerId:
 *                 type: integer
 *                 example: 2
 *               email:
 *                 type: string
 *                 example: surya@gmail.com
 *               mobile:
 *                 type: string
 *                 example: "7797863288"
 *               address:
 *                 type: string
 *                 example: Bhubaneswar
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-04-13
 *               time_slot:
 *                 type: string
 *                 example: "8:00 AM - 10:00 AM"
 *               total_amount:
 *                 type: number
 *                 example: 790
 *               services:
 *                 type: array
 *                 description: List of services with frontend-calculated pricing
 *                 items:
 *                   type: object
 *                   required:
 *                     - service_code
 *                     - subservice_code
 *                     - quantity
 *                     - total_price
 *                   properties:
 *                     service_code:
 *                       type: string
 *                       example: MS10001
 *                     subservice_code:
 *                       type: string
 *                       example: MS10001-01
 *                     quantity:
 *                       type: integer
 *                       example: 1
 *                     base_price:
 *                       type: number
 *                       example: 500
 *                     emergency_price:
 *                       type: number
 *                       example: 200
 *                     gst:
 *                       type: number
 *                       example: 90
 *                     total_price:
 *                       type: number
 *                       example: 790
 *     responses:
 *       200:
 *         description: Payment initiated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 orderId:
 *                   type: string
 *                   example: BD1776002568648
 *                 amount:
 *                   type: number
 *                   example: 790
 *                 payment_urls:
 *                   type: object
 *                   properties:
 *                     web:
 *                       type: string
 *                       example: https://sandbox.juspay.in/link
 *                     mobile:
 *                       type: string
 *                       example: https://sandbox.juspay.in/mobile-link
 *                     iframe:
 *                       type: string
 *                       example: https://sandbox.juspay.in/iframe-link
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Invalid total amount"
 *       500:
 *         description: Payment initiation failed
 *         content:
 *           application/json:
 *             example:
 *               success: false
 *               message: "Payment init failed"
 */


router.post("/initiate", async (req, res) => {
  const transaction = await db.sequelize.transaction();

  try {
    console.log("\n=========== INITIATE START ===========");
    console.log("Request Body:", req.body);

    const {
      services,
      customerId,
      email,
      mobile,
      address,
      date,
      time_slot,
      total_amount,
    } = req.body;

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Services array required",
      });
    }

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: "customerId required",
      });
    }

    const finalAmount = Number(total_amount || 0);

    if (!finalAmount || finalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid total amount",
      });
    }

    const BASE_URL = process.env.BASE_URL || "http://localhost:4000";
    const order_id = `BD${Date.now()}`;

    // ✅ NO CALCULATION — TRUST FRONTEND
    const bookingsToCreate = services.map((item) => ({
      order_id,
      user_id: customerId,
      service_code: item.service_code,
      subservice_code: item.subservice_code,
      address,
      date,
      time_slot,

      quantity: item.quantity,

      base_price: item.base_price,
      emergency_price: item.emergency_price,

      gst: item.gst,
      total_price: item.total_price,

      payment_method: "ONLINE",
      payment_status: "INITIATED",
    }));

    const bookings = await db.ServiceOnBooking.bulkCreate(bookingsToCreate, {
      transaction,
    });

    // ✅ PAYMENT TABLE
    await db.Payment.create(
      {
        booking_id: bookings[0].id,
        order_code: order_id,
        amount: finalAmount,
        customer_id: customerId,
        initiated_at: new Date(),
        status: "INITIATED",
      },
      { transaction }
    );

    // ✅ JUSPAY
    const juspayResponse = await juspay.order.create({
      order_id,
      amount: finalAmount.toFixed(2),
      currency: "INR",
      customer_id: String(customerId),
      customer_email: email,
      customer_phone: mobile,
      return_url: `${BASE_URL}/api/payment/juspay/redirect`,
    });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      orderId: order_id,
      amount: finalAmount,
      payment_urls: {
        web: juspayResponse.payment_links?.web || null,
        mobile: juspayResponse.payment_links?.mobile || null,
        iframe: juspayResponse.payment_links?.iframe || null,
      },
    });
  } catch (err) {
    await transaction.rollback();

    console.error("❌ INITIATE ERROR:", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Payment init failed",
    });
  }
});

/**
 * =========================
 * JUSPAY WEBHOOK
 * =========================
 */
router.post("/webhook", async (req, res) => {
  try {
    console.log("=========== WEBHOOK START ===========");

    const orderId =
      req.body.order_id || req.body.orderId || req.body.merchant_order_id;

    if (!orderId) return res.sendStatus(200);

    const statusResp = await juspay.order.status(orderId);

    console.log("Juspay Status:", statusResp.status);

    if (statusResp.status === "CHARGED") {
      await db.Payment.update(
        { status: "SUCCESS" },
        { where: { order_code: orderId } }
      );

      await db.ServiceOnBooking.update(
        { payment_status: "PAID" },
        { where: { order_id: orderId } }
      );
    } else if (statusResp.status === "FAILED") {
      await db.Payment.update(
        { status: "FAILED" },
        { where: { order_code: orderId } }
      );
    }

    return res.sendStatus(200);
  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err);
    return res.sendStatus(500);
  }
});

/**
 * =========================
 * REDIRECT HANDLER
 * =========================
 */
router.all("/redirect", async (req, res) => {
  try {
    const order_id = req.body.order_id || req.query.order_id;
    const status = req.body.status || req.query.status;

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

    if (!order_id) {
      return res.redirect(`${FRONTEND_URL}/payment-failed`);
    }

    if (status === "CHARGED") {
      await db.Payment.update(
        { status: "SUCCESS" },
        { where: { order_code: order_id } }
      );

      await db.ServiceOnBooking.update(
        { payment_status: "PAID" },
        { where: { order_id } }
      );

      return res.redirect(`${FRONTEND_URL}/thank-you?order_id=${order_id}`);
    }

    await db.Payment.update(
      { status: "FAILED" },
      { where: { order_code: order_id } }
    );

    return res.redirect(`${FRONTEND_URL}/payment-failed?order_id=${order_id}`);
  } catch (err) {
    console.error("REDIRECT ERROR:", err);

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

    return res.redirect(`${FRONTEND_URL}/payment-failed`);
  }
});

module.exports = router;