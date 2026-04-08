

/////// tested 3rd stage /////


const express = require("express");
const db = require("../models");
const router = express.Router();
const juspay = require("./juspay");

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


/**
 * @swagger
 * /payment/juspay/initiate:
 *   post:
 *     summary: Create service booking & initiate Juspay payment
 *     description: |
 *       Creates one or multiple service bookings with ONLINE payment and initiates a Juspay order.
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
 *             properties:
 *               customerId:
 *                 type: integer
 *                 example: 23
 *               email:
 *                 type: string
 *                 example: test@gmail.com
 *               mobile:
 *                 type: string
 *                 example: "9999999999"
 *               address:
 *                 type: string
 *                 example: Bhubaneswar
 *               date:
 *                 type: string
 *                 format: date
 *                 example: 2026-02-05
 *               time_slot:
 *                 type: string
 *                 example: 10:00 AM - 11:00 AM
 *               gst:
 *                 type: number
 *                 example: 18
 *               services:
 *                 type: array
 *                 description: List of services to book
 *                 items:
 *                   type: object
 *                   required:
 *                     - service_code
 *                     - subservice_code
 *                     - quantity
 *                   properties:
 *                     service_code:
 *                       type: string
 *                       example: SRV001
 *                     subservice_code:
 *                       type: string
 *                       example: SUB001
 *                     quantity:
 *                       type: integer
 *                       example: 1
 *                     emergency_price:
 *                       type: number
 *                       example: 0
 *     responses:
 *       200:
 *         description: Juspay payment initiated successfully
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
 *                   example: BD1670000000000
 *                 juspay_id:
 *                   type: string
 *                   example: jp_123456789
 *                 status:
 *                   type: string
 *                   example: INITIATED
 *                 payment_urls:
 *                   type: object
 *                   properties:
 *                     web:
 *                       type: string
 *                       nullable: true
 *                       example: "https://juspay.in/web-link"
 *                     mobile:
 *                       type: string
 *                       nullable: true
 *                       example: "https://juspay.in/mobile-link"
 *                     iframe:
 *                       type: string
 *                       nullable: true
 *                       example: "https://juspay.in/iframe-link"
 *       400:
 *         description: Missing required fields or invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Services array required"
 *       500:
 *         description: Payment initiation failed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Payment init failed"
 */


/////////////////// current one code with a single order id showing ///////
// router.post("/initiate", async (req, res) => {
//   try {
//     console.log("\n=========== INITIATE START ===========");
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
//     // BASE URL FIX
//     // ===================================================
//     const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

//     console.log("BASE_URL:", BASE_URL);
//     console.log("ENV BASE_URL:", process.env.BASE_URL);

//     // ===================================================
//     // UNIQUE ORDER ID FIX (Prevents expired session)
//     // ===================================================
//     const order_id = `BD${Date.now()}`;

//     console.log("Generated Order ID:", order_id);

//     // =======================================
//     // FETCH SUBSERVICE PRICE FROM DB
//     // =======================================

//     const subservice = await db.SubService.findOne({
//       where: { subservice_code },
//     });

//     if (!subservice) {
//       return res.status(404).json({
//         success: false,
//         message: "Subservice not found",
//       });
//     }

//     const basePrice = Number(subservice.price);
//     const qty = Number(quantity);
//     const gstAmount = Number(gst || 0);
//     const emergencyAmount = Number(emergency_price || 0);

//     // =======================================
//     // CALCULATE TOTAL PRICE
//     // =======================================

//     const baseTotal = basePrice * qty;
//     const finalAmount = baseTotal + gstAmount + emergencyAmount;

//     console.log("Base Price:", basePrice);
//     console.log("Quantity:", qty);
//     console.log("GST:", gstAmount);
//     console.log("Emergency:", emergencyAmount);
//     console.log("Final Amount:", finalAmount);

//     // ===================================================
//     // CREATE BOOKING
//     // ===================================================
//     console.log("Creating booking...");

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
//       // total_price: amount,
//       total_price: finalAmount,
//       payment_method: "ONLINE",
//       payment_status: "INITIATED",
//     });

//     console.log("✔ Booking Created:", booking.id);

//     // ===================================================
//     // CREATE PAYMENT ENTRY
//     // ===================================================
//     console.log("Creating payment record...");

//     await db.Payment.create({
//       booking_id: booking.id,
//       order_code: order_id,
//       // amount,
//       amount: finalAmount,
//       customer_id: customerId,
//       initiated_at: new Date(),
//       status: "INITIATED",
//     });

//     console.log("✔ Payment Record Created");

//     // ===================================================
//     // INITIATE JUSPAY PAYMENT
//     // ===================================================
//     console.log("Creating Juspay Order...");

//     // const returnUrl = `${BASE_URL}/api/payment/juspay/redirect`;

//     const returnUrl = `${BASE_URL}/api/payment/juspay/redirect?platform=app`;

//     console.log("Return URL:", returnUrl);

//     const juspayResponse = await juspay.order.create({
//       order_id: order_id,
//       // amount: Number(amount).toFixed(2),
//       amount: Number(finalAmount).toFixed(2),
//       currency: "INR",
//       customer_id: String(customerId),
//       customer_email: email,
//       customer_phone: mobile,
//       return_url: returnUrl,
//     });

//     console.log("✔ Juspay Order Created");
//     console.log("Juspay ID:", juspayResponse.id);
//     console.log("Juspay Status:", juspayResponse.status);
//     console.log("Payment URL:", juspayResponse.payment_links?.web);
//     console.log("Expiry:", juspayResponse.order_expiry);

//     console.log("=========== INITIATE END ===========\n");

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
      gst,
      emergency_price,
    } = req.body;

    if (!services || services.length === 0) {
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

    const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

    const order_id = `BD${Date.now()}`;

    console.log("Generated Order ID:", order_id);

    let finalAmount = 0;

    const bookingsToCreate = [];

    // =====================================
    // FETCH ALL SUBSERVICES
    // =====================================

    for (const item of services) {
      const subservice = await db.SubService.findOne({
        where: { subservice_code: item.subservice_code },
        transaction,
      });

      if (!subservice) {
        throw new Error(`Subservice not found: ${item.subservice_code}`);
      }

      // const basePrice = Number(subservice.price);
      // const qty = Number(item.quantity || 1);

      // const total = basePrice * qty;

      // finalAmount += total;

      const basePrice = Number(subservice.price);
      const emergencyPrice = Number(item.emergency_price || 0);
      const qty = Number(item.quantity || 1);

      // if emergency price exists use it
      const priceToUse = emergencyPrice > 0 ? emergencyPrice : basePrice;

      const total = priceToUse * qty;

      finalAmount += total;

      bookingsToCreate.push({
        order_id,
        user_id: customerId,
        service_code: item.service_code,
        subservice_code: item.subservice_code,
        address,
        date,
        time_slot,
        gst: gst || 0,
        // emergency_price: emergency_price || 0,
        emergency_price: item.emergency_price || 0,
        quantity: qty,
        total_price: total,
        payment_method: "ONLINE",
        payment_status: "INITIATED",
      });

      console.log(
        `Service ${item.subservice_code} → Price: ${basePrice} Qty: ${qty} Total: ${total}`
      );
    }

    const gstAmount = Number(gst || 0);
    // const emergencyAmount = Number(emergency_price || 0);

    // finalAmount = finalAmount + gstAmount + emergencyAmount;

    finalAmount = finalAmount + gstAmount;

    console.log("Final Amount:", finalAmount);

    // =====================================
    // CREATE BOOKINGS
    // =====================================

    const bookings = await db.ServiceOnBooking.bulkCreate(bookingsToCreate, {
      transaction,
    });

    console.log("Bookings Created:", bookings.length);

    // =====================================
    // CREATE PAYMENT ENTRY
    // =====================================

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

    console.log("Payment Record Created");

    // =====================================
    // JUSPAY ORDER
    // =====================================

    const returnUrl = `${BASE_URL}/api/payment/juspay/redirect?platform=app`;

    const juspayResponse = await juspay.order.create({
      order_id: order_id,
      amount: Number(finalAmount).toFixed(2),
      currency: "INR",
      customer_id: String(customerId),
      customer_email: email,
      customer_phone: mobile,
      return_url: returnUrl,
    });

    console.log("Juspay Order Created:", juspayResponse.id);

    await transaction.commit();

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
    await transaction.rollback();

    console.error("❌ PAYMENT INIT ERROR →", err);

    return res.status(500).json({
      success: false,
      message: err.message || "Payment init failed",
    });
  }
});







// router.post("/initiate", async (req, res) => {
//   const transaction = await db.sequelize.transaction();

//   try {
//     console.log("\n=========== INITIATE START ===========");
//     console.log("Request Body:", req.body);

//     const {
//       services,
//       customerId,
//       email,
//       mobile,
//       address,
//       date,
//       time_slot,
//       emergency_price,
//     } = req.body;

//     if (!services || services.length === 0) {
//       return res.status(400).json({
//         success: false,
//         message: "Services array required",
//       });
//     }

//     if (!customerId) {
//       return res.status(400).json({
//         success: false,
//         message: "customerId required",
//       });
//     }

//     const BASE_URL = process.env.BASE_URL || "http://localhost:4000";

//     const order_id = `BD${Date.now()}`;

//     console.log("Generated Order ID:", order_id);

//     let subtotal = 0;

//     const bookingsToCreate = [];

//     // =====================================
//     // FETCH ALL SUBSERVICES
//     // =====================================

//     for (const item of services) {
//       const subservice = await db.SubService.findOne({
//         where: { subservice_code: item.subservice_code },
//         transaction,
//       });

//       if (!subservice) {
//         throw new Error(`Subservice not found: ${item.subservice_code}`);
//       }

//       const basePrice = Number(subservice.price);
//       const qty = Number(item.quantity || 1);

//       const serviceTotal = basePrice * qty;

//       subtotal += serviceTotal;

//       // bookingsToCreate.push({
//       //   order_id,
//       //   user_id: customerId,
//       //   service_code: item.service_code,
//       //   subservice_code: item.subservice_code,
//       //   address,
//       //   date,
//       //   time_slot,
//       //   quantity: qty,
//       //   total_price: serviceTotal,
//       //   emergency_price: emergency_price || 0,
//       //   payment_method: "ONLINE",
//       //   payment_status: "INITIATED",
//       // });



//       bookingsToCreate.push({
//         order_id,
//         user_id: customerId,
//         service_code: item.service_code,
//         subservice_code: item.subservice_code,
//         address,
//         date,
//         time_slot,

//         gst: Number(gst || 0), // ⭐ IMPORTANT FIX

//         emergency_price: emergency_price || 0,
//         quantity: qty,
//         total_price: total,

//         payment_method: "ONLINE",
//         payment_status: "INITIATED",
//       });

//       console.log(
//         `Service ${item.subservice_code} → Price: ${basePrice} Qty: ${qty} Total: ${serviceTotal}`
//       );
//     }

//     // =====================================
//     // CALCULATE GST + FINAL AMOUNT
//     // =====================================

//     const gstAmount = subtotal * 0.18;
//     const emergencyAmount = Number(emergency_price || 0);

//     const finalAmount = subtotal + gstAmount + emergencyAmount;

//     console.log("========== PAYMENT CALCULATION ==========");
//     console.log("Subtotal:", subtotal);
//     console.log("GST (18%):", gstAmount);
//     console.log("Emergency:", emergencyAmount);
//     console.log("Final Amount:", finalAmount);
//     console.log("=========================================");

//     // =====================================
//     // CREATE BOOKINGS
//     // =====================================

//     const bookings = await db.ServiceOnBooking.bulkCreate(bookingsToCreate, {
//       transaction,
//     });

//     console.log("Bookings Created:", bookings.length);

//     // =====================================
//     // CREATE PAYMENT ENTRY
//     // =====================================

//     await db.Payment.create(
//       {
//         booking_id: bookings[0].id,
//         order_code: order_id,
//         amount: finalAmount,
//         customer_id: customerId,
//         initiated_at: new Date(),
//         status: "INITIATED",
//       },
//       { transaction }
//     );

//     console.log("Payment Record Created");

//     // =====================================
//     // JUSPAY ORDER
//     // =====================================

//     const returnUrl = `${BASE_URL}/api/payment/juspay/redirect?platform=app`;

//     const juspayResponse = await juspay.order.create({
//       order_id: order_id,
//       amount: parseFloat(finalAmount).toFixed(2),
//       currency: "INR",
//       customer_id: String(customerId),
//       customer_email: email,
//       customer_phone: mobile,
//       return_url: returnUrl,
//     });

//     console.log("Juspay Order Created:", juspayResponse.id);

//     await transaction.commit();

//     console.log("=========== INITIATE END ===========\n");

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
//     await transaction.rollback();

//     console.error("❌ PAYMENT INIT ERROR →", err);

//     return res.status(500).json({
//       success: false,
//       message: err.message || "Payment init failed",
//     });
//   }
// });





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


router.all("/redirect", async (req, res) => {
  try {
    console.log("\n=========== REDIRECT START ===========");

    const order_id = req.body.order_id || req.query.order_id;
    const paymentStatus = req.body.status || req.query.status;

    const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

    console.log("Order ID:", order_id);
    console.log("Payment Status:", paymentStatus);
    console.log("Frontend URL:", FRONTEND_URL);

    if (!order_id) {
      return res.redirect(`${FRONTEND_URL}/payment-failed`);
    }

    const payment = await db.Payment.findOne({
      where: { order_code: order_id },
    });

    if (paymentStatus === "CHARGED") {
      console.log("✔ Payment SUCCESS");

      await db.Payment.update(
        { status: "SUCCESS" },
        { where: { order_code: order_id } }
      );

      await db.ServiceOnBooking.update(
        { payment_status: "PAID" },
        { where: { order_id: order_id } }
      );

      return res.redirect(`${FRONTEND_URL}/thank-you?order_id=${order_id}`);
    }

    console.log("❌ Payment FAILED");

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
