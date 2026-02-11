const db = require("../../../models");
const TechnicianWallet = db.technician_wallets;
const WalletTransaction = db.wallet_transactions;

exports.deductCommission = async ({
  technicianId,
  bookingId,
  jobAmount,
  commissionPercent,
}) => {
  const commissionAmount = Math.round((jobAmount * commissionPercent) / 100);

  const wallet = await TechnicianWallet.findOne({
    where: { technician_id: technicianId },
  });

  if (!wallet || wallet.balance < commissionAmount) {
    throw new Error("Insufficient wallet balance for commission");
  }

  // Deduct balance
  wallet.balance -= commissionAmount;
  await wallet.save();

  // Wallet transaction entry
  await WalletTransaction.create({
    technician_id: technicianId,
    booking_id: bookingId,
    amount: commissionAmount,
    type: "COMMISSION",
    status: "SUCCESS",
  });

  return {
    commissionAmount,
    remainingBalance: wallet.balance,
  };
};
