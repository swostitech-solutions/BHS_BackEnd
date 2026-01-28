/**
 * HDFC SmartGateway Configuration
 * 
 * ============================================
 * REQUIRED CREDENTIALS FROM HDFC BANK:
 * ============================================
 * 
 * 1. HDFC_MERCHANT_ID - Your unique merchant identifier
 * 2. HDFC_SECRET_KEY - Secret key for API authentication & signature
 * 3. HDFC_API_KEY - API key for request headers
 * 
 * Get these from: https://smartgateway.hdfcbank.com
 * Documentation: https://smartgateway.hdfcbank.com/docs
 * 
 * Add these to your .env file:
 * 
 *   HDFC_MERCHANT_ID=your_merchant_id
 *   HDFC_SECRET_KEY=your_secret_key
 *   HDFC_API_KEY=your_api_key
 *   HDFC_ENVIRONMENT=sandbox
 * 
 * ============================================
 * GATEWAY URLs:
 * ============================================
 * 
 * Sandbox (Testing): https://smartgateway-sandbox.hdfcbank.com
 * Production:        https://smartgateway.hdfcbank.com
 * 
 */

require("dotenv").config();

// Determine environment
const isProduction = process.env.HDFC_ENVIRONMENT === "production";

const hdfcConfig = {
  // Merchant credentials
  merchantId: process.env.HDFC_MERCHANT_ID || "",
  secretKey: process.env.HDFC_SECRET_KEY || "",
  apiKey: process.env.HDFC_API_KEY || "",

  // Environment
  environment: process.env.HDFC_ENVIRONMENT || "sandbox",
  isProduction,

  // Gateway URLs
  baseUrl: isProduction
    ? "https://smartgateway.hdfcbank.com"
    : process.env.HDFC_BASE_URL || "https://smartgateway.hdfcbank.com",

  // API Endpoints
  endpoints: {
    createSession: "/api/v1/payment/session/create",
    paymentStatus: "/api/v1/payment/status",
    refund: "/api/v1/payment/refund",
    webhook: "/api/v1/webhook",
  },

  // Callback URLs (your server endpoints)
  callbackUrl:
    process.env.HDFC_CALLBACK_URL ||
    "http://localhost:3000/api/payment/callback",
  webhookUrl:
    process.env.HDFC_WEBHOOK_URL ||
    "http://localhost:3000/api/payment/webhook",

  // Frontend URLs (where to redirect user after payment)
  frontendSuccessUrl:
    process.env.FRONTEND_SUCCESS_URL ||
    process.env.FRONTEND_URL + "/payment/success" ||
    "http://localhost:5173/payment/success",
  frontendFailureUrl:
    process.env.FRONTEND_FAILURE_URL ||
    process.env.FRONTEND_URL + "/payment/failed" ||
    "http://localhost:5173/payment/failed",
  frontendCancelUrl:
    process.env.FRONTEND_CANCEL_URL ||
    process.env.FRONTEND_URL + "/payment/cancelled" ||
    "http://localhost:5173/payment/cancelled",

  // Frontend URL for general redirects
  frontendUrl: process.env.FRONTEND_URL || "http://localhost:5173",

  // Payment defaults
  currency: "INR",
  language: "EN",

  // Timeout settings (in milliseconds)
  requestTimeout: 30000,
  sessionExpiry: 1800, // 30 minutes in seconds
};

// Validation helper
const validateConfig = () => {
  const required = ["merchantId", "secretKey"];
  const missing = required.filter((key) => !hdfcConfig[key]);

  if (missing.length > 0) {
    console.warn(
      `⚠️  HDFC SmartGateway: Missing configuration - ${missing.join(", ")}`
    );
    console.warn("   Payment features will not work until credentials are configured.");
    console.warn("   Get credentials from: https://smartgateway.hdfcbank.com");
    return false;
  }

  console.log(`✅ HDFC SmartGateway configured (${hdfcConfig.environment} mode)`);
  return true;
};

// Log configuration status on load
validateConfig();

module.exports = {
  hdfcConfig,
  validateConfig,
};
