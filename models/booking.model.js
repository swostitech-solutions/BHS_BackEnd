module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "Booking",
    {
      status: {
        type: DataTypes.ENUM(
          "CREATED",
          "ASSIGNED",
          "ACCEPTED",
          "IN_PROGRESS",
          "COMPLETED",
          "CLOSED",
          "REJECTED"
        ),
        defaultValue: "CREATED",
      },
      booking_date: DataTypes.DATEONLY,
      time_slot: DataTypes.STRING,
    },
    {
      tableName: "bookings",
      timestamps: true,
    }
  );
};
