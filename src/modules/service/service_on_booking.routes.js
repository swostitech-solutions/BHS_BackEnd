const express = require("express");
const router = express.Router();
const controller = require("./service_on_booking.controller");
const upload = require("./upload.middleware");

/**
 * @swagger
 * tags:
 *   name: ServiceOnBooking
 *   description: Manage cash-on-delivery bookings
 */

/**
 * @swagger
 * /service-on-booking:
 *   post:
 *     summary: Create a new booking (COD)
 *     tags: [ServiceOnBooking]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - user_id
 *               - service_code
 *               - subservice_code
 *               - address
 *               - date
 *               - time_slot
 *               - gst
 *               - quantity
 *               - price
 *             properties:
 *               user_id:
 *                 type: integer
 *                 example: 1
 *               service_code:
 *                 type: string
 *                 example: "AC10001"
 *               subservice_code:
 *                 type: string
 *                 example: "AC10001-01"
 *               address:
 *                 type: string
 *                 example: "123 Main Street"
 *               date:
 *                 type: string
 *                 format: date
 *                 example: "2026-01-10"
 *               time_slot:
 *                 type: string
 *                 example: "10:00-12:00"
 *               gst:
 *                 type: number
 *                 example: 18
 *               emergency_price:
 *                 type: number
 *                 example: 100
 *               quantity:
 *                 type: number
 *                 example: 2
 *               price:
 *                 type: number
 *                 example: 499
 *     responses:
 *       201:
 *         description: Booking created successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.post("/", controller.createBooking);

/**
 * @swagger
 * /service-on-booking:
 *   get:
 *     summary: Get all bookings
 *     tags: [ServiceOnBooking]
 *     responses:
 *       200:
 *         description: List of all bookings
 *       500:
 *         description: Server error
 */
router.get("/", controller.getAllBookings);





/**
 * @swagger
 * /service-on-booking/user/{user_id}:
 *   get:
 *     summary: Get bookings by user ID
 *     tags: [ServiceOnBooking]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID
 *     responses:
 *       200:
 *         description: User bookings fetched successfully
 *       404:
 *         description: No bookings found
 *       500:
 *         description: Server error
 */
router.get("/user/:user_id", controller.getBookingsByUserId);







/**
 * @swagger
 * /service-on-booking/technician/{technician_id}:
 *   get:
 *     summary: Get all bookings assigned to a technician
 *     tags: [ServiceOnBooking]
 *     parameters:
 *       - in: path
 *         name: technician_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: User ID of the technician
 *     responses:
 *       200:
 *         description: Technician bookings fetched successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Server error
 */
router.get(
  "/technician/:technician_id",
  controller.getBookingsByTechnicianId
);





/**
 * @swagger
 * /service-on-booking/{order_id}:
 *   get:
 *     summary: Get booking by order ID
 *     tags: [ServiceOnBooking]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID of the booking
 *     responses:
 *       200:
 *         description: Booking details
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.get("/:order_id", controller.getBookingByOrderId);




/**
 * @swagger
 * /service-on-booking/service/{service_code}:
 *   get:
 *     summary: Get bookings by service code
 *     tags: [ServiceOnBooking]
 *     parameters:
 *       - in: path
 *         name: service_code
 *         required: true
 *         schema:
 *           type: string
 *         description: Service code (e.g. S10001)
 *     responses:
 *       200:
 *         description: Bookings fetched successfully
 *       404:
 *         description: No bookings found
 *       500:
 *         description: Server error
 */
router.get(
  "/service/:service_code",
  controller.getBookingsByServiceCode
);





/**
 * @swagger
 * /service-on-booking/accept/{order_id}:
 *   post:
 *     summary: Technician accepts or rejects a booking
 *     tags: [ServiceOnBooking]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Order ID of the booking
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - technician_id
 *             properties:
 *               technician_id:
 *                 type: integer
 *                 example: 2
 *                 description: User ID of the technician
 *               opinion:
 *                 type: integer
 *                 enum: [1, 2]
 *                 example: 1
 *                 description: |
 *                   Technician opinion on the booking:  
 *                   1 = Accept  
 *                   2 = Reject
 *     responses:
 *       200:
 *         description: Booking accepted or rejected successfully
 *       400:
 *         description: Validation error or invalid opinion
 *       404:
 *         description: Booking or Technician not found
 *       500:
 *         description: Server error
 */
router.post("/accept/:order_id", controller.acceptBooking);




/**
 * @swagger
 * /service-on-booking/work-status/{order_id}:
 *   post:
 *     summary: Update work status (Pending / Completed)
 *     description: Technician updates work status with optional notes and image
 *     tags: [ServiceOnBooking]
 *     parameters:
 *       - in: path
 *         name: order_id
 *         required: true
 *         schema:
 *           type: string
 *         description: Booking Order ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - technician_id
 *               - work_status
 *             properties:
 *               technician_id:
 *                 type: integer
 *                 example: 15
 *               work_status:
 *                 type: integer
 *                 enum: [1, 3]
 *                 example: 3
 *                 description: |
 *                   1 = Pending  
 *                   3 = Completed
 *               notes:
 *                 type: string
 *                 example: Job completed successfully
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: Work completion image
 *     responses:
 *       200:
 *         description: Work status updated successfully
 *       400:
 *         description: Invalid request
 *       404:
 *         description: Booking not found
 *       500:
 *         description: Server error
 */
router.post(
  "/work-status/:order_id",
  upload.single("image"),
  controller.updateWorkStatus
);



module.exports = router;
