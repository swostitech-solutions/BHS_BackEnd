module.exports = (sequelize, DataTypes) => {
  const Cart = sequelize.define(
    "Cart",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // user_id: {
      //   type: DataTypes.INTEGER,
      //   allowNull: true, // ✅ changed
      // },

      // guest_id: {
      //   type: DataTypes.STRING, // ✅ added
      //   allowNull: true,
      // },

      service_id: {
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
      tableName: "cart",
      timestamps: true,
    }
  );

  return Cart;
};
