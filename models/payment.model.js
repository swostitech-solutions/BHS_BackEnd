
module.exports = (sequelize, DataTypes) => {
  const Payment = sequelize.define(
    "Payment",
    {
      booking_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // Business order reference (BD100034)
      order_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },

      customer_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("INITIATED", "SUCCESS", "FAILED"),
        defaultValue: "INITIATED",
      },

      gateway_order_id: DataTypes.STRING,
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

  return Payment;
};
