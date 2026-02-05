
module.exports = (sequelize, DataTypes) => {
  const Technician = sequelize.define(
    "Technician",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },

      skill: DataTypes.STRING,
      experience: DataTypes.INTEGER,

      aadharCardNo: DataTypes.STRING,
      panCardNo: DataTypes.STRING,

      bankName: DataTypes.STRING,
      ifscNo: {
        type: DataTypes.STRING,
        validate: { is: /^[A-Za-z0-9]+$/i },
      },
      branchName: DataTypes.STRING,

      /* Existing fields */
      timeDuration: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emergencyAvailable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      techCategory: {
        type: DataTypes.STRING,
        allowNull: true,
      },

      status: {
        type: DataTypes.ENUM("PENDING", "ACCEPT", "REJECT"),
        defaultValue: "PENDING",
      },

      /* ⭐ RATING SYSTEM (NEW) */
      avg_rating: {
        type: DataTypes.DECIMAL(2, 1),
        allowNull: false,
        defaultValue: 0.0,
      },

      rating_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },

      /* 📄 FILE UPLOADS */
      profileImage: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Profile image filename/path",
      },
      aadharDoc: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Uploaded Aadhar card document filename/path",
      },
      panDoc: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Uploaded PAN card document filename/path",
      },
      bankPassbookDoc: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Uploaded bank passbook document filename/path",
      },
      experienceCertDoc: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Uploaded experience certificate document filename/path",
      },
    },
    {
      tableName: "technicians",
      timestamps: true,
    }
  );

  return Technician;
};
