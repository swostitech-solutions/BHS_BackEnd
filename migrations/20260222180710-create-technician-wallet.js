"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("technician_wallets", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      technician_id: {
        type: Sequelize.INTEGER,
        unique: true,
        allowNull: false,
      },
      balance: {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
      },
      status: {
        type: Sequelize.ENUM("active", "blocked"),
        defaultValue: "active",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("technician_wallets");
  },
};
