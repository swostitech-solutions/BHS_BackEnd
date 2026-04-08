"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_wallet_transactions_source"
      ADD VALUE IF NOT EXISTS 'WITHDRAW';
    `);
  },

  async down(queryInterface, Sequelize) {
    // ⚠️ Postgres does NOT support removing enum values easily
    // So we keep this empty
  },
};
