
module.exports = (sequelize, DataTypes) => {
  return sequelize.define(
    "PasswordReset",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      // ✅ MUST BE NULLABLE (email OR phone flow)
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      // ✅ MUST BE NULLABLE
      mobile: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      otp: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      otp_expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },

      attempts_left: {
        type: DataTypes.INTEGER,
        defaultValue: 3,
      },

      reset_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      reset_token_expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },

      is_used: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      tableName: "password_resets",
      timestamps: true,
    }
  );
};
