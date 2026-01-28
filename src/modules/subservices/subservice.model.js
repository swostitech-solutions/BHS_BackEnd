

module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "SubService",
    {
      subservice_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      price: {
        type: DataTypes.DECIMAL,
        allowNull: false,
      },
      emergency_price: {
        type: DataTypes.DECIMAL,
        allowNull: true, // optional
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING, // filename or URL
        allowNull: true,
      },
      service_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "subservices",
      timestamps: true,
    }
  );
};

