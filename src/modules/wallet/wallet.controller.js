// const db = require("../../../models");
// const juspay = require("../../../payments/juspay");

// const TechnicianWallet = db.TechnicianWallet;
// const WalletTransaction = db.WalletTransaction;

// exports.createWalletTopup = async (req, res) => {
//   try {
//     const { technician_id, amount, email, mobile } = req.body;

//     if (!technician_id || !amount || !email || !mobile || amount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "technician_id, amount, email, mobile are required",
//       });
//     }

//     /* 1️⃣ FIND / CREATE WALLET */
//     let wallet = await TechnicianWallet.findOne({
//       where: { technician_id },
//     });

//     if (!wallet) {
//       wallet = await TechnicianWallet.create({
//         technician_id,
//         balance: 0,
//       });
//     }

//     /* 2️⃣ GENERATE ORDER ID (CONSISTENT FORMAT) */
//     const order_id = `WL${Date.now()}`;

//     /* 3️⃣ CREATE TRANSACTION */
//     await WalletTransaction.create({
//       technician_id,
//       wallet_id: wallet.id,
//       order_id,
//       amount,
//       type: "CREDIT",
//       source: "TOPUP",
//       status: "PENDING",
//     });

//     /* 4️⃣ CREATE JUSPAY ORDER */
//     const juspayResponse = await juspay.order.create({
//       order_id,
//       amount: Number(amount).toFixed(2),
//       currency: "INR",
//       customer_id: String(technician_id),
//       customer_email: email,
//       customer_phone: mobile,
//       return_url: `${process.env.BASE_URL}/api/payment/juspay/redirect?order_id=${order_id}`,
//     });

//     return res.json({
//       success: true,
//       order_id,
//       payment_urls: {
//         web: juspayResponse.payment_links?.web || null,
//         mobile: juspayResponse.payment_links?.mobile || null,
//         iframe: juspayResponse.payment_links?.iframe || null,
//       },
//     });
//   } catch (err) {
//     console.error("WALLET TOPUP ERROR →", err);
//     return res.status(500).json({
//       success: false,
//       message: "Wallet topup failed",
//     });
//   }
// };

// exports.getWalletBalance = async (req, res) => {
//   const wallet = await db.TechnicianWallet.findOne({
//     where: { technician_id: req.params.technicianId },
//   });

//   res.json({ balance: wallet ? wallet.balance : 0 });
// };

// exports.getWalletTransactions = async (req, res) => {
//   const transactions = await db.WalletTransaction.findAll({
//     where: { technician_id: req.params.technicianId },
//     order: [["createdAt", "DESC"]],
//   });

//   res.json(transactions);
// };










///////// Properly working with success meesgae ////////

const db = require("../../../models");
const juspay = require("../../../payments/juspay");

const TechnicianWallet = db.TechnicianWallet;
const WalletTransaction = db.WalletTransaction;

/**
 * ===============================
 * CREATE WALLET TOPUP
 * ===============================
 */
exports.createWalletTopup = async (req, res) => {
  try {
    const { technician_id, amount, email, mobile } = req.body;

    if (!technician_id || !amount || !email || !mobile || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "technician_id, amount, email, mobile are required",
      });
    }

    /* 1️⃣ Find or create wallet */
    let wallet = await TechnicianWallet.findOne({
      where: { technician_id },
    });

    if (!wallet) {
      wallet = await TechnicianWallet.create({
        technician_id,
        balance: 0,
      });
    }

    /* 2️⃣ Generate order id */
    const order_id = `WL${Date.now()}`;

    /* 3️⃣ Create wallet transaction */
    await WalletTransaction.create({
      technician_id,
      wallet_id: wallet.id,
      order_id,
      amount,
      type: "CREDIT",
      source: "TOPUP",
      status: "PENDING",
    });

    /* 4️⃣ Create Juspay order */
    const juspayResponse = await juspay.order.create({
      order_id,
      amount: Number(amount).toFixed(2),
      currency: "INR",
      customer_id: String(technician_id),
      customer_email: email,
      customer_phone: mobile,
      return_url: `${process.env.BASE_URL}/api/wallet/verify?order_id=${order_id}`,
    });

    return res.json({
      success: true,
      order_id,
      payment_urls: {
        web: juspayResponse.payment_links?.web || null,
        mobile: juspayResponse.payment_links?.mobile || null,
        iframe: juspayResponse.payment_links?.iframe || null,
      },
    });
  } catch (err) {
    console.error("WALLET TOPUP ERROR →", err);
    return res.status(500).json({
      success: false,
      message: "Wallet topup failed",
    });
  }
};

/**
 * ===============================
 * VERIFY WALLET TOPUP (JUSPAY)
 * ===============================
 */
// exports.verifyWalletTopup = async (req, res) => {
//   try {
//     const { order_id } = req.query;

//     if (!order_id) {
//       return res.status(400).json({ message: "order_id required" });
//     }

//     /* 1️⃣ Fetch transaction */
//     const txn = await WalletTransaction.findOne({ where: { order_id } });

//     if (!txn) {
//       return res.status(404).json({ message: "Transaction not found" });
//     }

//     /* 🔐 Prevent double credit */
//     if (txn.status === "SUCCESS") {
//       return res.redirect(
//         `${process.env.FRONTEND_URL}/wallet-success?order_id=${order_id}`
//       );
//     }

//     /* 2️⃣ Verify payment status from Juspay */
//     const statusResp = await juspay.order.status(order_id);

//     if (statusResp.status === "CHARGED") {
//       /* 3️⃣ Update transaction */
//       txn.status = "SUCCESS";
//       txn.payment_txn_id = statusResp.txn_id || statusResp.payment_id || null;
//       await txn.save();

//       /* 4️⃣ Credit wallet balance */
//       let wallet = await TechnicianWallet.findOne({
//         where: { technician_id: txn.technician_id },
//       });

//       if (!wallet) {
//         wallet = await TechnicianWallet.create({
//           technician_id: txn.technician_id,
//           balance: 0,
//         });
//       }

//       wallet.balance = Number(wallet.balance) + Number(txn.amount);
//       await wallet.save();

//       return res.redirect(
//         `${process.env.FRONTEND_URL}/wallet-success?order_id=${order_id}`
//       );
//     }

//     /* ❌ Payment failed */
//     txn.status = "FAILED";
//     await txn.save();

//     return res.redirect(
//       `${process.env.FRONTEND_URL}/wallet-failed?order_id=${order_id}`
//     );
//   } catch (err) {
//     console.error("VERIFY WALLET ERROR →", err);
//     return res.status(500).json({ message: "Verification failed" });
//   }
// };




exports.verifyWalletTopup = async (req, res) => {
  try {
    const order_id = req.query.order_id || req.body.order_id;

    if (!order_id) {
      return res.status(400).json({ message: "order_id required" });
    }

    const txn = await WalletTransaction.findOne({ where: { order_id } });

    if (!txn) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // 🔐 Prevent double credit
    if (txn.status === "SUCCESS") {
      return res.redirect(
        `${process.env.FRONTEND_URL}/wallet-success?order_id=${order_id}`
      );
    }

    const statusResp = await juspay.order.status(order_id);

    if (statusResp.status === "CHARGED") {
      txn.status = "SUCCESS";
      txn.payment_txn_id = statusResp.txn_id || statusResp.payment_id || null;
      await txn.save();

      let wallet = await TechnicianWallet.findOne({
        where: { technician_id: txn.technician_id },
      });

      if (!wallet) {
        wallet = await TechnicianWallet.create({
          technician_id: txn.technician_id,
          balance: 0,
        });
      }

      wallet.balance = Number(wallet.balance) + Number(txn.amount);
      await wallet.save();

      return res.redirect(
        `${process.env.FRONTEND_URL}/wallet-success?order_id=${order_id}`
      );
    }

    txn.status = "FAILED";
    await txn.save();

    return res.redirect(
      `${process.env.FRONTEND_URL}/wallet-failed?order_id=${order_id}`
    );
  } catch (err) {
    console.error("VERIFY WALLET ERROR →", err);
    return res.status(500).json({ message: "Verification failed" });
  }
};


/**
 * ===============================
 * GET WALLET BALANCE
 * ===============================
 */
exports.getWalletBalance = async (req, res) => {
  try {
    const wallet = await TechnicianWallet.findOne({
      where: { technician_id: req.params.technicianId },
    });

    return res.json({
      balance: wallet ? wallet.balance : "0.00",
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch wallet balance" });
  }
};

/**
 * ===============================
 * GET WALLET TRANSACTIONS
 * ===============================
 */
exports.getWalletTransactions = async (req, res) => {
  try {
    const transactions = await WalletTransaction.findAll({
      where: { technician_id: req.params.technicianId },
      order: [["createdAt", "DESC"]],
    });

    return res.json(transactions);
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Failed to fetch wallet transactions" });
  }
};






//// wallet withdrawal request and processing //////

// exports.withdrawFromWallet = async (req, res) => {
//   try {
//     const { technician_id, amount } = req.body;

//     if (!technician_id || !amount || amount <= 0) {
//       return res.status(400).json({
//         message: "technician_id and valid amount are required",
//       });
//     }

//     const wallet = await TechnicianWallet.findOne({
//       where: { technician_id },
//     });

//     if (!wallet || Number(wallet.balance) < Number(amount)) {
//       return res.status(400).json({
//         message: "Insufficient wallet balance",
//       });
//     }

//     // Deduct balance
//     wallet.balance = Number(wallet.balance) - Number(amount);
//     await wallet.save();

//     // Create transaction record
//     await WalletTransaction.create({
//       technician_id,
//       wallet_id: wallet.id,
//       amount,
//       type: "DEBIT",
//       source: "WITHDRAWAL",
//       status: "PENDING", // mark SUCCESS after bank transfer
//     });

//     return res.json({
//       success: true,
//       message: "Withdrawal initiated",
//       remainingBalance: wallet.balance,
//     });
//   } catch (error) {
//     console.error("WALLET WITHDRAW ERROR →", error);
//     return res.status(500).json({
//       success: false,
//       message: "Withdrawal failed",
//     });
//   }
// };





exports.withdrawFromWallet = async (req, res) => {
  const t = await db.sequelize.transaction();

  try {
    const { technician_id, amount } = req.body;

    if (!technician_id || !amount || amount <= 0) {
      await t.rollback();
      return res.status(400).json({
        message: "technician_id and valid amount are required",
      });
    }

    const wallet = await TechnicianWallet.findOne({
      where: { technician_id },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });

    if (!wallet || Number(wallet.balance) < Number(amount)) {
      await t.rollback();
      return res.status(400).json({
        message: "Insufficient wallet balance",
      });
    }

    // Deduct balance
    wallet.balance = Number(wallet.balance) - Number(amount);
    await wallet.save({ transaction: t });

    // Create transaction record
    await WalletTransaction.create(
      {
        technician_id,
        wallet_id: wallet.id,
        amount,
        type: "DEBIT", // ✅ enum-safe
        source: "WITHDRAWAL", // ✅ must exist in DB enum
        status: "PENDING",
      },
      { transaction: t }
    );

    await t.commit();

    return res.json({
      success: true,
      message: "Withdrawal initiated",
      remainingBalance: wallet.balance,
    });
  } catch (error) {
    await t.rollback();
    console.error("WALLET WITHDRAW ERROR →", error);
    return res.status(500).json({
      success: false,
      message: "Withdrawal failed",
    });
  }
};








































