module.exports = (sequelize, DataTypes) => {
  const GstRate = sequelize.define(
    "GstRate",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },

      cgst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 9.0,
      },

      sgst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 9.0,
      },

      igst_rate: {
        type: DataTypes.DECIMAL(5, 2),
        defaultValue: 18.0,
      },
    },
    {
      tableName: "gst_rates",
      timestamps: false,
    }
  );

  return GstRate;
};
