const db = require("../../../models");
const User = db.User;
const bcrypt = require("bcrypt");

/**
 * Change user password
 * Requires: user_id, current_password, new_password, confirm_password
 * - Checks previous password
 * - Updates lastLogin on login elsewhere if needed
 */
exports.changePassword = async (req, res) => {
  try {
    const { user_id, current_password, new_password, confirm_password } =
      req.body;

    if (!user_id || !current_password || !new_password || !confirm_password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (new_password !== confirm_password) {
      return res
        .status(400)
        .json({ message: "New password and confirmation do not match" });
    }

    // Find user
    const user = await User.findByPk(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      current_password,
      user.password
    );
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Check if new password matches previous password
    if (user.previousPassword) {
      const isPreviousPassword = await bcrypt.compare(
        new_password,
        user.previousPassword
      );
      if (isPreviousPassword) {
        return res
          .status(400)
          .json({
            message: "New password cannot be the same as previous password",
          });
      }
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(new_password, 10);

    // Save previous password
    user.previousPassword = user.password;
    user.password = hashedNewPassword;

    await user.save();

    return res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("CHANGE PASSWORD ERROR →", error);
    return res.status(500).json({ message: "Server error" });
  }
};
