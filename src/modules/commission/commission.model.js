// module.exports = (sequelize, DataTypes) => {
//   const CommissionRate = sequelize.define(
//     "CommissionRate",
//     {
//       id: {
//         type: DataTypes.INTEGER,
//         autoIncrement: true,
//         primaryKey: true,
//       },
//       commission_percentage: {
//         type: DataTypes.DECIMAL(5, 2),
//         allowNull: false,
//         defaultValue: 10.0,
//       },
//       is_active: {
//         type: DataTypes.BOOLEAN,
//         defaultValue: true,
//       },
//     },
//     {
//       tableName: "commission_rates",
//       timestamps: true,
//     }
//   );

//   return CommissionRate;
// };








module.exports = (sequelize, DataTypes) => {
  const CommissionRate = sequelize.define(
    "CommissionRate",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      commission_percentage: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 10.0,
      },
    },
    {
      tableName: "commission_rates",
      timestamps: false,
    }
  );

  return CommissionRate;
};
