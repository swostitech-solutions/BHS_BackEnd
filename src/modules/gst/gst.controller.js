const db = require("../../../models");
const GstRate = db.GstRate;

// default fallback
const DEFAULT_RATES = {
  cgst: 9,
  sgst: 9,
  igst: 18,
};

exports.calculateGst = async (req, res) => {
  try {
    let { base_amount, is_inter_state } = req.body;

    if (!base_amount) {
      return res.status(400).json({
        message: "base_amount is required",
      });
    }

    base_amount = parseFloat(base_amount);

    // load configured rates if available
    const rates = (await GstRate.findOne()) || DEFAULT_RATES;

    let response = {
      base_amount,
      gst_type: "",
      cgst: 0,
      sgst: 0,
      igst: 0,
      total_gst: 0,
      grand_total: 0,
    };

    if (is_inter_state) {
      // IGST 18%
      const igst = (base_amount * rates.igst) / 100;

      response.gst_type = "IGST (Inter-State)";
      response.igst = igst.toFixed(2);
      response.total_gst = igst.toFixed(2);
      response.grand_total = (base_amount + igst).toFixed(2);
    } else {
      // CGST 9% + SGST 9%
      const cgst = (base_amount * rates.cgst) / 100;
      const sgst = (base_amount * rates.sgst) / 100;

      response.gst_type = "CGST + SGST (Intra-State)";
      response.cgst = cgst.toFixed(2);
      response.sgst = sgst.toFixed(2);
      response.total_gst = (cgst + sgst).toFixed(2);
      response.grand_total = (base_amount + cgst + sgst).toFixed(2);
    }

    return res.status(200).json({
      message: "GST calculated successfully",
      data: response,
    });
  } catch (err) {
    console.error("GST CALC ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};

















