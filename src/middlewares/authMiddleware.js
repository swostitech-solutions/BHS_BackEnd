const jwt = require("jsonwebtoken");
const db = require("../../models");
const sequelize = db.sequelize;

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Token missing" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    const [session] = await sequelize.query(
      `SELECT * FROM user_sessions 
       WHERE user_id = :userId AND access_token = :token`,
      {
        replacements: {
          userId: decoded.userId,
          token,
        },
      }
    );

    if (!session.length) {
      return res.status(401).json({ message: "Session expired or logged out" });
    }

    req.user = decoded; // { userId, roleId }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
