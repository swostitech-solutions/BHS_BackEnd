'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Fix the gst column precision from DECIMAL(5,2) to DECIMAL(10,2)
    // DECIMAL(5,2) only allows values up to 999.99
    // DECIMAL(10,2) allows values up to 99999999.99
    await queryInterface.changeColumn('service_on_booking', 'gst', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert back to original (not recommended if data exceeds 999.99)
    await queryInterface.changeColumn('service_on_booking', 'gst', {
      type: Sequelize.DECIMAL(5, 2),
      allowNull: false,
    });
  }
};
