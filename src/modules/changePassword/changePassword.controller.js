
///////////// current code working properly 31 march /////


// const db = require("../../../models");
// const User = db.User;
// const bcrypt = require("bcrypt");

// /**
//  * Change user password
//  * Requires: user_id, current_password, new_password, confirm_password
//  * - Checks previous password
//  * - Updates lastLogin on login elsewhere if needed
//  */
// exports.changePassword = async (req, res) => {
//   try {
//     const { user_id, current_password, new_password, confirm_password } =
//       req.body;

//     if (!user_id || !current_password || !new_password || !confirm_password) {
//       return res.status(400).json({ message: "All fields are required" });
//     }

//     if (new_password !== confirm_password) {
//       return res
//         .status(400)
//         .json({ message: "New password and confirmation do not match" });
//     }

//     // Find user
//     const user = await User.findByPk(user_id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Verify current password
//     const isCurrentPasswordValid = await bcrypt.compare(
//       current_password,
//       user.password
//     );
//     if (!isCurrentPasswordValid) {
//       return res.status(400).json({ message: "Current password is incorrect" });
//     }

//     // Check if new password matches previous password
//     if (user.previousPassword) {
//       const isPreviousPassword = await bcrypt.compare(
//         new_password,
//         user.previousPassword
//       );
//       if (isPreviousPassword) {
//         return res
//           .status(400)
//           .json({
//             message: "New password cannot be the same as previous password",
//           });
//       }
//     }

//     // Hash new password
//     const hashedNewPassword = await bcrypt.hash(new_password, 10);

//     // Save previous password
//     user.previousPassword = user.password;
//     user.password = hashedNewPassword;

//     await user.save();

//     return res.json({ message: "Password changed successfully" });
//   } catch (error) {
//     console.error("CHANGE PASSWORD ERROR →", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

























const db = require("../../../models");
const User = db.User;
const PasswordReset = db.PasswordReset;

const bcrypt = require("bcryptjs"); // ✅ keep consistent
const crypto = require("crypto");
const axios = require("axios");
const { Op } = require("sequelize");

/* ============================================================
   SEND OTP SMS (SAFE VERSION)
============================================================ */
const sendOtpSMS = async (phone, otp) => {
  try {
    const url = "https://www.fast2sms.com/dev/bulkV2";

    const params = {
      authorization: process.env.FAST2SMS_API_KEY,
      route: "dlt",
      sender_id: process.env.FAST2SMS_SENDER_ID,
      message: process.env.FAST2SMS_TEMPLATE_ID,
      variables_values: otp,
      flash: 0,
      numbers: phone,
      entity_id: process.env.FAST2SMS_ENTITY_ID,
    };

    console.log("📤 FAST2SMS PARAMS:", params);

    const res = await axios.get(url, { params });

    console.log("✅ FAST2SMS RESPONSE:", res.data);

    return true;
  } catch (err) {
    console.error("❌ SMS FAILED:", err.response?.data || err.message);

    // fallback (VERY IMPORTANT)
    console.log("📲 OTP (DEV FALLBACK):", otp);

    return false;
  }
};

/* ============================================================
   1. REQUEST OTP
============================================================ */
exports.requestOtp = async (req, res) => {
  try {
    const { username, current_password } = req.body;

    if (!username || !current_password) {
      return res.status(400).json({
        message: "Username and current password required",
      });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(
      current_password.trim(),
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    // ✅ DELETE OLD OTP
    await PasswordReset.destroy({
      where: {
        user_id: user.id,
        type: "CHANGE_PASSWORD",
        is_used: false,
      },
    });

    // ✅ GENERATE OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await PasswordReset.create({
      user_id: user.id,
      email: user.email,
      mobile: user.mobile,
      otp: hashedOtp,
      otp_expires_at: new Date(Date.now() + 10 * 60 * 1000),
      attempts_left: 3,
      is_used: false,
      type: "CHANGE_PASSWORD",
    });

    // ✅ SEND OTP
    const smsSent = await sendOtpSMS(user.mobile, otp);

    return res.json({
      message: smsSent
        ? "OTP sent successfully"
        : "OTP generated (SMS failed, check logs)",
      mobile: user.mobile,
    });
  } catch (error) {
    console.error("❌ REQUEST OTP ERROR FULL:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message, // 👈 IMPORTANT
    });
  }
};

/* ============================================================
   2. VERIFY OTP
============================================================ */
exports.verifyOtp = async (req, res) => {
  try {
    const { username, otp } = req.body;

    if (!username || !otp) {
      return res.status(400).json({
        message: "Username and OTP required",
      });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const record = await PasswordReset.findOne({
      where: {
        user_id: user.id,
        is_used: false,
        type: "CHANGE_PASSWORD",
      },
      order: [["createdAt", "DESC"]],
    });

    if (!record) {
      return res.status(400).json({ message: "No OTP found" });
    }

    if (new Date() > record.otp_expires_at) {
      return res.status(400).json({ message: "OTP expired" });
    }

    if (record.attempts_left <= 0) {
      return res.status(400).json({
        message: "Too many attempts",
      });
    }

    const isValid = await bcrypt.compare(otp, record.otp);

    if (!isValid) {
      await record.decrement("attempts_left");

      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    await record.update({
      reset_token: token,
      reset_token_expires_at: new Date(Date.now() + 10 * 60 * 1000),
      is_used: true,
    });

    return res.json({
      message: "OTP verified",
      token,
    });
  } catch (error) {
    console.error("❌ VERIFY OTP ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

/* ============================================================
   3. CHANGE PASSWORD
============================================================ */
exports.changePassword = async (req, res) => {
  try {
    const { username, token, new_password, confirm_password } = req.body;

    if (!username || !token || !new_password || !confirm_password) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    if (new_password !== confirm_password) {
      return res.status(400).json({
        message: "Passwords do not match",
      });
    }

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const record = await PasswordReset.findOne({
      where: {
        user_id: user.id,
        reset_token: token,
        type: "CHANGE_PASSWORD",
      },
    });

    if (!record) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (new Date() > record.reset_token_expires_at) {
      return res.status(400).json({ message: "Token expired" });
    }

    // ✅ prevent same password
    if (user.previousPassword) {
      const isSame = await bcrypt.compare(new_password, user.previousPassword);

      if (isSame) {
        return res.status(400).json({
          message: "New password cannot be same as previous password",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    user.previousPassword = user.password;
    user.password = hashedPassword;

    await user.save();

    await record.update({
      reset_token: null,
      reset_token_expires_at: null,
      is_used: true,
    });

    return res.json({
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("❌ CHANGE PASSWORD ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};