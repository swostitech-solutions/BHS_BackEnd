"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "service_on_booking",
      "service_on_booking_order_id_key"
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addConstraint("service_on_booking", {
      fields: ["order_id"],
      type: "unique",
      name: "service_on_booking_order_id_key",
    });
  },
};
