const { Juspay } = require("expresscheckout-nodejs");
const config = require("../keys/juspay_config.json");

const BASE_URL =
  config.ENV === "PRODUCTION"
    ? "https://smartgateway.hdfc.bank.in"
    : "https://smartgateway.hdfcuat.bank.in";

if (!config.MERCHANT_ID || !config.API_KEY) {
  throw new Error("Juspay config missing MERCHANT_ID or API_KEY");
}

const juspay = new Juspay({
  merchantId: config.MERCHANT_ID,
  apiKey: config.API_KEY,
  baseUrl: BASE_URL,
});

console.log("✅ Juspay initialized:", {
  merchantId: config.MERCHANT_ID,
  env: config.ENV,
});

module.exports = juspay;












