const jwt = require("jsonwebtoken");
const db = require("../../../models");
const sequelize = db.sequelize;
const { generateAccessToken } = require("../../utils/token");

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: "Refresh token required" });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    const [session] = await sequelize.query(
      `SELECT * FROM user_sessions 
       WHERE user_id = :userId AND refresh_token = :refreshToken`,
      {
        replacements: {
          userId: decoded.userId,
          refreshToken,
        },
      }
    );

    if (!session.length) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }

    const newAccessToken = generateAccessToken({
      id: decoded.userId,
      roleId: session[0].role_id,
    });

    await sequelize.query(
      `UPDATE user_sessions 
       SET access_token = :newAccessToken
       WHERE user_id = :userId`,
      {
        replacements: {
          userId: decoded.userId,
          newAccessToken,
        },
      }
    );

    return res.json({
      accessToken: newAccessToken,
    });
  } catch (err) {
    return res.status(401).json({ message: "Refresh token expired" });
  }
};
