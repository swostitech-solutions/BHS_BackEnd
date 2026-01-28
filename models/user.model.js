module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define(
    "User",
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },

      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },

      email: {
        type: DataTypes.STRING,
        unique: true,
      },

      mobile: {
        type: DataTypes.STRING,
      },

      address: {
        type: DataTypes.STRING,
      },

      roleId: {
        type: DataTypes.INTEGER, // 1-Admin, 2-Client, 3-Technician
        allowNull: false,
      },

      status: {
        type: DataTypes.ENUM("ACTIVE", "INACTIVE"),
        defaultValue: "ACTIVE",
      },

      /* ✅ CLIENT PROFILE IMAGE (NEW) */
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Client profile image path",
      },

      lastLogin: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Tracks the last login timestamp",
      },

      previousPassword: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Stores previous password hash to prevent reuse",
      },
    },
    {
      tableName: "users",
      timestamps: true,
    }
  );

  return User;
};
