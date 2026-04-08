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




















//// 8 APR ////

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

//     // ✅ Ensure payment_status column
//     await db.sequelize.query(`
//       ALTER TABLE "service_on_booking"
//       ADD COLUMN IF NOT EXISTS "payment_status" VARCHAR(20) DEFAULT 'INITIATED';
//     `);
//     console.log("✔ payment_status column ensured");

//     // ✅ 🔥 ADD THIS (FIX YOUR ERROR)
//     await db.sequelize.query(`
//       ALTER TABLE "password_resets"
//       ADD COLUMN IF NOT EXISTS "type" VARCHAR(50) DEFAULT 'FORGOT_PASSWORD';
//     `);
//     console.log("✔ type column ensured in password_resets");

//     // ✅ Sync models
//     await db.sequelize.sync();
//     console.log("✔ Models synchronized");
//   } catch (err) {
//     console.error("✖ Unable to start server:", err);
//   }

//   app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
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

//     // ✅ Ensure payment_status column
//     await db.sequelize.query(`
//       ALTER TABLE "service_on_booking"
//       ADD COLUMN IF NOT EXISTS "payment_status" VARCHAR(20) DEFAULT 'INITIATED';
//     `);
//     console.log("✔ payment_status column ensured");

//     // ✅ Ensure type column in password_resets
//     await db.sequelize.query(`
//       ALTER TABLE "password_resets"
//       ADD COLUMN IF NOT EXISTS "type" VARCHAR(50) DEFAULT 'FORGOT_PASSWORD';
//     `);
//     console.log("✔ type column ensured in password_resets");

//     // ================================
//     // ✅ ENUM FIX (IMPORTANT 🔥)
//     // ================================

//     // ✅ Ensure WITHDRAW exists
//     await db.sequelize.query(`
//       DO $$
//       BEGIN
//         IF NOT EXISTS (
//           SELECT 1 FROM pg_enum 
//           WHERE enumlabel = 'WITHDRAW'
//           AND enumtypid = (
//             SELECT oid FROM pg_type WHERE typname = 'enum_wallet_transactions_source'
//           )
//         ) THEN
//           ALTER TYPE "enum_wallet_transactions_source" ADD VALUE 'WITHDRAW';
//         END IF;
//       END$$;
//     `);
//     console.log("✔ WITHDRAW enum ensured");

//     // ✅ Ensure COMMISSION exists
//     await db.sequelize.query(`
//       DO $$
//       BEGIN
//         IF NOT EXISTS (
//           SELECT 1 FROM pg_enum 
//           WHERE enumlabel = 'COMMISSION'
//           AND enumtypid = (
//             SELECT oid FROM pg_type WHERE typname = 'enum_wallet_transactions_source'
//           )
//         ) THEN
//           ALTER TYPE "enum_wallet_transactions_source" ADD VALUE 'COMMISSION';
//         END IF;
//       END$$;
//     `);
//     console.log("✔ COMMISSION enum ensured");

//     // ================================
//     // ✅ Sync models
//     // ================================
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

    // ✅ Ensure type column in password_resets
    await db.sequelize.query(`
      ALTER TABLE "password_resets"
      ADD COLUMN IF NOT EXISTS "type" VARCHAR(50) DEFAULT 'FORGOT_PASSWORD';
    `);
    console.log("✔ type column ensured in password_resets");

    // ================================
    // ✅ ENUM FIX (IMPORTANT 🔥)
    // ================================

    // ✅ Ensure WITHDRAW exists
    await db.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'WITHDRAW'
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_wallet_transactions_source'
          )
        ) THEN
          ALTER TYPE "enum_wallet_transactions_source" ADD VALUE 'WITHDRAW';
        END IF;
      END$$;
    `);
    console.log("✔ WITHDRAW enum ensured");

    // ✅ Ensure COMMISSION exists
    await db.sequelize.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_enum 
          WHERE enumlabel = 'COMMISSION'
          AND enumtypid = (
            SELECT oid FROM pg_type WHERE typname = 'enum_wallet_transactions_source'
          )
        ) THEN
          ALTER TYPE "enum_wallet_transactions_source" ADD VALUE 'COMMISSION';
        END IF;
      END$$;
    `);
    console.log("✔ COMMISSION enum ensured");

    // ================================
    // 🔥 FIX ORDER_ID UNIQUE ISSUE
    // ================================

    await db.sequelize.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'service_on_booking_order_id_key'
        ) THEN
          ALTER TABLE "service_on_booking"
          DROP CONSTRAINT "service_on_booking_order_id_key";
        END IF;
      END$$;
    `);
    console.log("✔ order_id unique constraint removed");

    // ================================
    // ✅ Sync models
    // ================================
    await db.sequelize.sync();
    console.log("✔ Models synchronized");
  } catch (err) {
    console.error("✖ Unable to start server:", err);
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
})();