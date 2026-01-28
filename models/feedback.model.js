
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Feedback",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      technician_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      service_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subservice_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "feedbacks",
      timestamps: true,
    }
  );
};
