const express = require("express");
const router = express.Router();


// Temporary health check
router.get("/", (req, res) => {
  res.json({ message: "BHS Backend API running" });
});

// Auth (Signup + Users APIs)
router.use("/auth", require("./modules/auth/auth.routes"));

// Module routes (will expand later)
router.use("/services", require("./modules/services/service.routes"));
router.use("/subservices", require("./modules/subservices/subservice.routes")); 
router.use("/cart", require("./modules/cart/cart.routes"));

// --- Mount GST module ---
router.use("/gst", require("./modules/gst/gst.routes"));

// --- Emergency Pricing Module ---
router.use("/emergency-pricing", require("./modules/emergency_pricing/emergency_pricing.routes"));

// --- Service_on_booking Module ---
router.use("/service-on-booking", require("./modules/service/service_on_booking.routes"));


// --- change-password Module ---

router.use("/change-password", require("./modules/changePassword/changePassword.routes"));


// --- Feedback Module ---
router.use("/feedback", require("./modules/feedback/feedback.routes"));




// --- Wallet Module ---
router.use("/wallet", require("./modules/wallet/wallet.routes"));


// /// --- withdrawal Module ---
// router.post("/withdraw", walletController.withdrawFromWallet);





module.exports = router;
