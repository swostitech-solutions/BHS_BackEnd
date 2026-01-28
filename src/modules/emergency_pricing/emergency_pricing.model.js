module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "EmergencyPricing",
    {
      urgency_level: {
        type: DataTypes.STRING,
        allowNull: false, // e.g., "super_emergency"
      },
      label: {
        type: DataTypes.STRING, // e.g., "Super Emergency (30–45 mins)"
        allowNull: false,
      },
      percentage_markup: {
        type: DataTypes.DECIMAL(5, 2), // e.g., 40.00
        allowNull: false,
      },
      multiplier: {
        type: DataTypes.DECIMAL(5, 2), // e.g., 1.4
        allowNull: false,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "emergency_pricing",
      timestamps: true,
    }
  );
};
