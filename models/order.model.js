
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      // Business order code
      order_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },

      address: DataTypes.TEXT,
      service_date: DataTypes.DATEONLY,
      time_slot: DataTypes.STRING,

      status: {
        type: DataTypes.ENUM(
          "CREATED",
          "PAID",
          "ASSIGNED",
          "IN_PROGRESS",
          "COMPLETED",
          "CANCELLED"
        ),
        defaultValue: "CREATED",
      },

      total_amount: DataTypes.DECIMAL(10, 2),
    },
    {
      tableName: "orders",
      timestamps: true,
    }
  );

  return Order;
};
