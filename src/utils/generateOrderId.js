
const db = require("../../models");

module.exports = async function generateOrderId() {
  // ONLY FROM BOOKING TABLE ✅
  const lastBooking = await db.ServiceOnBooking.findOne({
    order: [["id", "DESC"]],
  });

  let max = 100000;

  if (lastBooking?.order_id) {
    max = parseInt(lastBooking.order_id.replace("BD", ""));
  }

  return `BD${max + 1}`;
};
