// require("dotenv").config();

// const app = require("./app");
// const db = require("../models");

// const PORT = process.env.PORT || 5000;

// (async () => {
//   try {
//     await db.sequelize.authenticate();
//     console.log("✔ DB connected");

//     // ❌ REMOVE alter:true
//     await db.sequelize.sync();
//     console.log("✔ Models synchronized");
//   } catch (err) {
//     console.error("✖ Unable to start server:", err);
//   }

//   app.listen(PORT, () => {
//     console.log(` Server running on port ${PORT}`);
//   });
// })();










///////// currrnety working code 30mar ////

// require("dotenv").config();

// const app = require("./app");
// const db = require("../models");

// const PORT = process.env.PORT || 5000;

// (async () => {
//   try {
//     await db.sequelize.authenticate();
//     console.log("✔ DB connected");

//     // ✅ FIX: Ensure column exists (only runs once safely)
//     await db.sequelize.query(`
//       ALTER TABLE "technicians"
//       ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
//     `);

//     console.log("✔ isActive column ensured");

//     // Optional: keep sync
//     await db.sequelize.sync();
//     console.log("✔ Models synchronized");
//   } catch (err) {
//     console.error("✖ Unable to start server:", err);
//   }

//   app.listen(PORT, () => {
//     console.log(` Server running on port ${PORT}`);
//   });
// })();
















// require("dotenv").config();

// const app = require("./app");
// const db = require("../models");

// const PORT = process.env.PORT || 5000;

// (async () => {
//   try {
//     await db.sequelize.authenticate();
//     console.log("✔ DB connected");

//     // ✅ Ensure isActive column in technicians
//     await db.sequelize.query(`
//       ALTER TABLE "technicians"
//       ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
//     `);
//     console.log("✔ isActive column ensured");

//     // ✅ ADD THIS (VERY IMPORTANT - payment_status column)
//     await db.sequelize.query(`
//       ALTER TABLE "service_on_booking"
//       ADD COLUMN IF NOT EXISTS "payment_status" VARCHAR(20) DEFAULT 'INITIATED';
//     `);
//     console.log("✔ payment_status column ensured");

//     // ✅ Normal sync (SAFE)
//     await db.sequelize.sync();
//     console.log("✔ Models synchronized");
//   } catch (err) {
//     console.error("✖ Unable to start server:", err);
//   }

//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//   });
// })();






















require("dotenv").config();

const app = require("./app");
const db = require("../models");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✔ DB connected");

    // ✅ Ensure isActive column in technicians
    await db.sequelize.query(`
      ALTER TABLE "technicians"
      ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;
    `);
    console.log("✔ isActive column ensured");

    // ✅ Ensure payment_status column
    await db.sequelize.query(`
      ALTER TABLE "service_on_booking"
      ADD COLUMN IF NOT EXISTS "payment_status" VARCHAR(20) DEFAULT 'INITIATED';
    `);
    console.log("✔ payment_status column ensured");

    // ✅ 🔥 ADD THIS (FIX YOUR ERROR)
    await db.sequelize.query(`
      ALTER TABLE "password_resets"
      ADD COLUMN IF NOT EXISTS "type" VARCHAR(50) DEFAULT 'FORGOT_PASSWORD';
    `);
    console.log("✔ type column ensured in password_resets");

    // ✅ Sync models
    await db.sequelize.sync();
    console.log("✔ Models synchronized");
  } catch (err) {
    console.error("✖ Unable to start server:", err);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})();