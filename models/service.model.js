module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Service",
    {
      service_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        defaultValue: "ACTIVE",
        allowNull: false,
      },
    },
    {
      tableName: "services",
      timestamps: true,
    }
  );
};
