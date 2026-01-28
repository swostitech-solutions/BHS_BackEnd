// module.exports = (sequelize, DataTypes) => {
//   return sequelize.define(
//     "Payment",
//     {
//       amount: DataTypes.DECIMAL,
//       status: {
//         type: DataTypes.ENUM("PAID", "HOLD", "RELEASED"),
//         defaultValue: "PAID",
//       },
//     },
//     {
//       tableName: "payments",
//       timestamps: true,
//     }
//   );
// };



module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Payment",
    {
      transaction_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },

      // BUSINESS ORDER ID – STRING
      order_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      currency: {
        type: DataTypes.STRING,
        defaultValue: "INR",
      },

      status: {
        type: DataTypes.ENUM("PENDING", "SUCCESS", "FAILED", "CANCELLED"),
        defaultValue: "PENDING",
      },

      billing_name: DataTypes.STRING,
      billing_email: DataTypes.STRING,
      billing_phone: DataTypes.STRING,
      billing_address: DataTypes.TEXT,

      tracking_id: DataTypes.STRING,
      bank_ref_no: DataTypes.STRING,
      payment_mode: DataTypes.STRING,
      card_name: DataTypes.STRING,

      response_code: DataTypes.STRING,
      response_message: DataTypes.TEXT,
      gateway_response: DataTypes.JSON,

      initiated_at: DataTypes.DATE,
      completed_at: DataTypes.DATE,
    },
    {
      tableName: "payments",
      timestamps: true,
    }
  );
};
