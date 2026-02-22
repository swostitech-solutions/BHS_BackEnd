"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("wallet_transactions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      technician_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      wallet_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      type: {
        type: Sequelize.ENUM("CREDIT", "DEBIT"),
      },
      source: {
        type: Sequelize.ENUM("TOPUP", "JOB", "REFUND", "WITHDRAW"),
      },
      order_id: {
        type: Sequelize.STRING,
        unique: true,
      },
      payment_txn_id: Sequelize.STRING,
      status: {
        type: Sequelize.ENUM("PENDING", "SUCCESS", "FAILED"),
        defaultValue: "PENDING",
      },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("wallet_transactions");
  },
};
