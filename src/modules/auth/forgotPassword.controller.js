


const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const axios = require("axios");
const db = require("../../../models");


const User = db.User;
const PasswordReset = db.PasswordReset;
const Op = db.Sequelize.Op;

/* ===================================================== */
/* ===================== HELPERS ======================= */
/* ===================================================== */

const generateOTP = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const maskPhone = (phone) => phone.replace(/(\d{2})\d{6}(\d{2})/, "$1******$2");

/* ===================================================== */
/* ===================== SEND SMS ====================== */
/* ===================================================== */
const sendOtpSMS = async (phone, otp) => {
  try {
    const url =
      `https://www.fast2sms.com/dev/bulkV2` +
      `?authorization=${process.env.FAST2SMS_API_KEY}` +
      `&route=dlt` +
      `&sender_id=${process.env.FAST2SMS_SENDER_ID}` +
      `&message=${process.env.FAST2SMS_TEMPLATE_ID}` +
      `&variables_values=${otp}` +
      `&flash=0` +
      `&numbers=${phone}`;

    console.log("📤 FAST2SMS REQUEST URL:", url);

    const res = await axios.get(url);

    console.log("✅ FAST2SMS RESPONSE:", res.data);

    return res.data;
  } catch (err) {
    console.error("❌ SMS FAILED:", err.response?.data || err.message);
    return null;
  }
};

/* ===================================================== */
/* ================= FORGOT PASSWORD =================== */
/* ===================================================== */

exports.forgotPassword = async (req, res) => {
  try {
    const { identifier, identifierType } = req.body;

    if (!identifier || !identifierType) {
      return res.status(400).json({
        success: false,
        message: "identifier and identifierType are required",
      });
    }

    const cleanIdentifier =
      identifierType === "phone"
        ? identifier.replace(/\D/g, "").slice(-10)
        : identifier.trim().toLowerCase();

    let user;

    if (identifierType === "email") {
      user = await User.findOne({ where: { email: cleanIdentifier } });
    } else if (identifierType === "phone") {
      user = await User.findOne({ where: { mobile: cleanIdentifier } });
    } else {
      return res.status(400).json({
        success: false,
        message: "identifierType must be email or phone",
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Remove previous unused OTPs
    await PasswordReset.destroy({
      where: {
        user_id: user.id,
        is_used: false,
      },
    });

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await PasswordReset.create({
      user_id: user.id,
      email: identifierType === "email" ? cleanIdentifier : null,
      mobile: identifierType === "phone" ? cleanIdentifier : null,
      otp: hashedOtp,
      otp_expires_at: new Date(Date.now() + 10 * 60 * 1000),
      attempts_left: 3,
      is_used: false,
    });

    let message = "OTP generated";

    if (identifierType === "email") {
      const emailResult = await sendOtpEmail(cleanIdentifier, otp);
      message = emailResult.success
        ? "OTP sent to email"
        : "OTP generated (email delivery failed)";
    } else {
      const smsSent = await sendOtpSMS(cleanIdentifier, otp);

      if (!smsSent) {
        console.log("📲 OTP (DEV / FALLBACK):", otp);
        message = "OTP generated (SMS blocked by provider)";
      } else {
        message = "OTP sent to mobile number";
      }
    }

    return res.status(200).json({
      success: true,
      message,
      sentTo:
        identifierType === "email"
          ? maskEmail(cleanIdentifier)
          : maskPhone(cleanIdentifier),
      identifierType,
      expiresIn: 600,
    });
  } catch (err) {
    console.error("FORGOT PASSWORD ERROR →", err);
    return res.status(500).json({
      success: false,
      message: "Failed to process forgot password",
    });
  }
};

/* ===================================================== */
/* ================= VERIFY OTP ======================== */
/* ===================================================== */

exports.verifyOtp = async (req, res) => {
  try {
    const { identifier, otp } = req.body;

    const cleanIdentifier = identifier.includes("@")
      ? identifier.trim().toLowerCase()
      : identifier.replace(/\D/g, "").slice(-10);

    const record = await PasswordReset.findOne({
      where: {
        is_used: false,
        [Op.or]: [{ email: cleanIdentifier }, { mobile: cleanIdentifier }],
      },
      order: [["createdAt", "DESC"]],
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const isValid = await bcrypt.compare(otp, record.otp);

    if (!isValid) {
      await record.decrement("attempts_left");
      return res.status(400).json({
        success: false,
        message: "Wrong OTP",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");

    await record.update({
      reset_token: resetToken,
      reset_token_expires_at: new Date(Date.now() + 15 * 60 * 1000),
      is_used: true,
    });

    return res.json({
      success: true,
      resetToken,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

/* ===================================================== */
/* ================= RESET PASSWORD ==================== */
/* ===================================================== */

exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    const record = await PasswordReset.findOne({
      where: { reset_token: resetToken },
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await User.update({ password: hash }, { where: { id: record.user_id } });

    await record.update({
      reset_token: null,
    });

    return res.json({
      success: true,
      message: "Password updated successfully",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};
