
module.exports = (sequelize, DataTypes) => {
  const OrderItem = sequelize.define(
    "OrderItem",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      // FK → orders.id (NOT order_code)
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      subservice_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      quantity: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },

      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
    },
    {
      tableName: "order_items",
      timestamps: true,
    }
  );

  return OrderItem;
};
