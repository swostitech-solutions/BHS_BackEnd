module.exports = (sequelize, DataTypes) => {
  const TechnicianWallet = sequelize.define("technician_wallets", {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    technician_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    balance: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
    },
    status: {
      type: DataTypes.ENUM("active", "blocked"),
      defaultValue: "active",
    },
  });

  return TechnicianWallet;
};










// module.exports = (sequelize, DataTypes) => {
//   const TechnicianWallet = sequelize.define("technician_wallets", {
//     id: {
//       type: DataTypes.INTEGER,
//       autoIncrement: true,
//       primaryKey: true,
//     },
//     technician_id: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       unique: true,
//       references: {
//         model: "technicians", // table name
//         key: "id",
//       },
//       onDelete: "CASCADE",
//       onUpdate: "CASCADE",
//     },
//     balance: {
//       type: DataTypes.DECIMAL(10, 2),
//       defaultValue: 0,
//     },
//     status: {
//       type: DataTypes.ENUM("active", "blocked"),
//       defaultValue: "active",
//     },
//   });

//   return TechnicianWallet;
// };