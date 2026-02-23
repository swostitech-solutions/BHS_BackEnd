module.exports = (sequelize, DataTypes) => {
  const WalletTransaction = sequelize.define("wallet_transactions", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    technician_id: DataTypes.INTEGER,
    wallet_id: DataTypes.INTEGER,
    amount: DataTypes.DECIMAL(10, 2),
    type: {
      type: DataTypes.ENUM("CREDIT", "DEBIT"),
    },
    source: {
      type: DataTypes.ENUM("TOPUP", "JOB", "REFUND"),
      defaultValue: "TOPUP",
    },
    order_id: DataTypes.STRING,
    payment_txn_id: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
      defaultValue: "PENDING",
    },
  });

  return WalletTransaction;
};











// module.exports = (sequelize, DataTypes) => {
//   const WalletTransaction = sequelize.define("wallet_transactions", {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },

//     technician_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },

//     wallet_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//     },

//     amount: {
//       type: DataTypes.DECIMAL(10, 2),
//       allowNull: false,
//     },

//     type: {
//       type: DataTypes.ENUM("CREDIT", "DEBIT"),
//       allowNull: false,
//     },

//     source: {
//       type: DataTypes.ENUM("TOPUP", "JOB", "REFUND", "WITHDRAW"),
//       defaultValue: "TOPUP",
//     },

//     order_id: {
//       type: DataTypes.STRING,
//       unique: true, // Important for verify API
//     },

//     payment_txn_id: {
//       type: DataTypes.STRING,
//     },

//     status: {
//       type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED"),
//       defaultValue: "PENDING",
//     },
//   });

//   return WalletTransaction;
// };