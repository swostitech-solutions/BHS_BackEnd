const db = require("../../../models");
const EmergencyPricing = db.EmergencyPricing;
const SubService = db.SubService;

// Create rule
exports.createRule = async (req, res) => {
  try {
    const { urgency_level, label, percentage_markup, multiplier } = req.body;

    // Basic validation
    if (
      !urgency_level ||
      !label ||
      percentage_markup == null ||
      multiplier == null
    ) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["urgency_level", "label", "percentage_markup", "multiplier"],
      });
    }

    // Ensure numeric values
    const pct = Number(percentage_markup);
    const mult = Number(multiplier);

    if (isNaN(pct) || isNaN(mult)) {
      return res.status(400).json({
        message: "percentage_markup and multiplier must be numeric values",
      });
    }

    const rule = await EmergencyPricing.create({
      urgency_level,
      label,
      percentage_markup: pct,
      multiplier: mult,
      is_active: req.body.is_active ?? true,
    });

    return res.status(201).json({ message: "Rule created", rule });
  } catch (err) {
    console.error("CREATE RULE ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all active rules
exports.getRules = async (_req, res) => {
  try {
    const rules = await EmergencyPricing.findAll({
      where: { is_active: true },
      order: [["createdAt", "DESC"]],
    });

    return res.json(rules);
  } catch (err) {
    console.error("GET RULES ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Calculate emergency price for a SubService
exports.calculateEmergencyPrice = async (req, res) => {
  try {
    const { subservice_id, urgency_level } = req.body;

    if (!subservice_id || !urgency_level) {
      return res.status(400).json({
        message: "subservice_id and urgency_level are required",
      });
    }

    const subservice = await SubService.findByPk(subservice_id);
    if (!subservice) {
      return res.status(404).json({ message: "SubService not found" });
    }

    const rule = await EmergencyPricing.findOne({
      where: { urgency_level, is_active: true },
    });

    if (!rule) {
      return res.status(404).json({ message: "Pricing rule not found" });
    }

    const basePrice = Number(subservice.price);
    const multiplier = Number(rule.multiplier);

    // const emergency_price = Number((basePrice * multiplier).toFixed(2));
    const emergency_price = Number((basePrice * multiplier).toFixed(2));
    const addon_price = Number((emergency_price - basePrice).toFixed(2));


    return res.json({
      message: "Emergency price calculated",
      data: {
        subservice_id,
        base_price: basePrice,
        urgency_level: rule.urgency_level,
        percentage_markup: Number(rule.percentage_markup),
        multiplier,
        addon_price, //new one 
        emergency_price,
      },
    });
  } catch (err) {
    console.error("EMERGENCY PRICE ERROR →", err);
    res.status(500).json({ message: "Server error" });
  }
};
