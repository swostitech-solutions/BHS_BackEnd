const Sequelize = require("sequelize");
const config = require("../config/config").development;

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

/* ===================== MODELS ===================== */
db.User = require("./user.model")(sequelize, Sequelize);
db.Service = require("./service.model")(sequelize, Sequelize);
// db.SubService = require("./subservice.model")(sequelize, Sequelize);
db.SubService = require("../src/modules/subservices/subservice.model")(sequelize, Sequelize);
db.Technician = require("./technician.model")(sequelize, Sequelize);
db.Cart = require("./cart.model")(sequelize, Sequelize);
db.Order = require("./order.model")(sequelize, Sequelize);
db.OrderItem = require("./orderItem.model")(sequelize, Sequelize);
db.Booking = require("./booking.model")(sequelize, Sequelize);
db.Payment = require("./payment.model")(sequelize, Sequelize);
db.GstRate = require("../src/modules/gst/gst.model")(sequelize, Sequelize);
db.EmergencyPricing =
  require("../src/modules/emergency_pricing/emergency_pricing.model")(
    sequelize,
    Sequelize
  );
db.ServiceOnBooking =
  require("../src/modules/service/service_on_booking.model")(
    sequelize,
    Sequelize
  );
db.Feedback = require("../models/feedback.model")(
  sequelize,
  Sequelize
);  
db.PasswordReset = require("./passwordReset.model")(sequelize, Sequelize);

/* ===================== RELATIONSHIPS ===================== */

/* USER ↔ CART */
db.User.hasMany(db.Cart, { foreignKey: "user_id" });
db.Cart.belongsTo(db.User, { foreignKey: "user_id" });

/* USER ↔ ORDER */
db.User.hasMany(db.Order, { foreignKey: "user_id" });
db.Order.belongsTo(db.User, { foreignKey: "user_id" });

/* USER ↔ TECHNICIAN (One-to-One) */
db.User.hasOne(db.Technician, {
  foreignKey: "userId",
  as: "technician",
});
db.Technician.belongsTo(db.User, {
  foreignKey: "userId",
  as: "user",
});

/* SERVICE → SUBSERVICE */
db.Service.hasMany(db.SubService, { foreignKey: "service_id" });
db.SubService.belongsTo(db.Service, { foreignKey: "service_id" });

/* CART */
db.Service.hasMany(db.Cart, { foreignKey: "service_id" });
db.SubService.hasMany(db.Cart, { foreignKey: "subservice_id" });
db.Cart.belongsTo(db.Service, { foreignKey: "service_id" });
db.Cart.belongsTo(db.SubService, { foreignKey: "subservice_id" });

/* ORDER ↔ ORDER ITEMS */
db.Order.hasMany(db.OrderItem, { foreignKey: "order_id" });
db.OrderItem.belongsTo(db.Order, { foreignKey: "order_id" });

/* SUBSERVICE ↔ ORDER ITEMS */
db.SubService.hasMany(db.OrderItem, { foreignKey: "subservice_id" });
db.OrderItem.belongsTo(db.SubService, { foreignKey: "subservice_id" });

/* BOOKING */
db.Order.hasOne(db.Booking, { foreignKey: "order_id" });
db.Booking.belongsTo(db.Order, { foreignKey: "order_id" });

db.Technician.hasMany(db.Booking, { foreignKey: "technician_id" });
db.Booking.belongsTo(db.Technician, { foreignKey: "technician_id" });

/* ✅ PAYMENT ↔ SERVICE ON BOOKING (CORRECT) */
db.ServiceOnBooking.hasOne(db.Payment, {
  foreignKey: "booking_id",
});

db.Payment.belongsTo(db.ServiceOnBooking, {
  foreignKey: "booking_id",
});

/* EMERGENCY PRICING */
db.EmergencyPricing.hasMany(db.SubService, {
  foreignKey: "emergency_rule_id",
  as: "subservices",
});

db.SubService.belongsTo(db.EmergencyPricing, {
  foreignKey: "emergency_rule_id",
  as: "emergency_rule",
});

/* SERVICE ON BOOKING */
db.Service.hasMany(db.ServiceOnBooking, {
  foreignKey: "service_code",
  sourceKey: "service_code",
});

db.SubService.hasMany(db.ServiceOnBooking, {
  foreignKey: "subservice_code",
  sourceKey: "subservice_code",
});

db.ServiceOnBooking.belongsTo(db.Service, {
  foreignKey: "service_code",
  targetKey: "service_code",
  as: "service",
});

db.ServiceOnBooking.belongsTo(db.SubService, {
  foreignKey: "subservice_code",
  targetKey: "subservice_code",
  as: "subservice",
});

db.User.hasMany(db.ServiceOnBooking, { foreignKey: "user_id" });
db.ServiceOnBooking.belongsTo(db.User, { foreignKey: "user_id" });

db.Technician.hasMany(db.ServiceOnBooking, { foreignKey: "technician_id" });
db.ServiceOnBooking.belongsTo(db.Technician, {
  foreignKey: "technician_id",
  as: "technician",
});

/* USER ↔ FEEDBACK */
db.User.hasMany(db.Feedback, { foreignKey: "user_id" });
db.Feedback.belongsTo(db.User, { foreignKey: "user_id" });

/* TECHNICIAN ↔ FEEDBACK */
db.Technician.hasMany(db.Feedback, {
  foreignKey: "technician_id",
});
db.Feedback.belongsTo(db.Technician, {
  foreignKey: "technician_id",
});

/* FORGOT PASSWORD */
db.User.hasMany(db.PasswordReset, { foreignKey: "user_id" });
db.PasswordReset.belongsTo(db.User, { foreignKey: "user_id" });



module.exports = db;
