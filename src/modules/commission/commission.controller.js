const db = require("../../../models");
const CommissionRate = db.CommissionRate;

// Default fallback
const DEFAULT_COMMISSION = 10;

exports.calculateCommission = async (req, res) => {
  try {
    let { base_amount } = req.body;

    if (!base_amount) {
      return res.status(400).json({
        message: "base_amount is required",
      });
    }

    base_amount = parseFloat(base_amount);

    if (isNaN(base_amount)) {
      return res.status(400).json({
        message: "base_amount must be numeric",
      });
    }

    // Fetch commission rate safely
    let commission_percentage = DEFAULT_COMMISSION;

    if (CommissionRate) {
      const rate = await CommissionRate.findOne();
      if (rate) {
        commission_percentage = parseFloat(rate.commission_percentage);
      }
    }

    const commission_amount = (base_amount * commission_percentage) / 100;

    const technician_payout = base_amount - commission_amount;

    return res.status(200).json({
      message: "Commission calculated successfully",
      data: {
        base_amount: base_amount.toFixed(2),
        commission_percentage,
        commission_amount: commission_amount.toFixed(2),
        technician_payout: technician_payout.toFixed(2),
      },
    });
  } catch (err) {
    console.error("COMMISSION CALC ERROR →", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};
