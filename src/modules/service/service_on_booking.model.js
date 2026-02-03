/// NEW 
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "ServiceOnBooking",
    {
      order_id: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      service_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      subservice_code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      time_slot: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gst: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      emergency_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total_price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      payment_method: {
        type: DataTypes.STRING,
        defaultValue: "COD",
      },

      /* Technician allocation */
      technician_allocated: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      technician_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      // work status
      work_status: {
        type: DataTypes.INTEGER,
        defaultValue: 1, // 1 = Pending // 3 = completed
      },

      work_status_code: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      work_notes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      // ✅ NEW (IMAGE FIELD)
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: "service_on_booking",
      timestamps: true,
    }
  );
};
