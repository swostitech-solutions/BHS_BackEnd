require("dotenv").config();

const app = require("./app");
const db = require("../models");

const PORT = process.env.PORT || 5000;

(async () => {
  try {
    await db.sequelize.authenticate();
    console.log("✔ DB connected");

    // ❌ REMOVE alter:true
    await db.sequelize.sync();
    console.log("✔ Models synchronized");
  } catch (err) {
    console.error("✖ Unable to start server:", err);
  }

  app.listen(PORT, () => {
    console.log(` Server running on port ${PORT}`);
  });
})();
