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
// const Technician = db.Technician;

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









// exports.createWalletTopup = async (req, res) => {
//   try {
//     const { technician_id, amount, email, mobile } = req.body;

//     if (!technician_id || !amount || !email || !mobile || amount <= 0) {
//       return res.status(400).json({
//         success: false,
//         message: "technician_id, amount, email, mobile are required",
//       });
//     }

//     // 1️⃣ Find or create wallet
//     let wallet = await TechnicianWallet.findOne({
//       where: { technician_id },
//     });

//     if (!wallet) {
//       wallet = await TechnicianWallet.create({
//         technician_id,
//         balance: 0,
//       });
//     }

//     // 2️⃣ Generate order id
//     const order_id = `WL${Date.now()}`;

//     // 3️⃣ Create transaction
//     await WalletTransaction.create({
//       technician_id,
//       wallet_id: wallet.id,
//       order_id,
//       amount,
//       type: "CREDIT",
//       source: "TOPUP",
//       status: "PENDING",
//     });

//     // 4️⃣ Create Juspay Order (OTP FLOW)
//     const juspayResponse = await juspay.order.create({
//       order_id: order_id,
//       amount: Math.round(Number(amount) * 100), // paise
//       currency: "INR",

//       customer_id: String(technician_id),
//       customer_email: email,
//       customer_phone: mobile,

//       // 🔴 IMPORTANT FOR OTP
//       payment_page_client_id: "hdfc",

//       // 🔴 IMPORTANT FOR REDIRECT
//       return_url: `${process.env.BASE_URL}/api/wallet/verify?order_id=${order_id}`,

//       description: "Wallet Topup",

//       metadata: {
//         type: "wallet",
//         technician_id,
//       },
//     });

//     console.log("JUSPAY RESPONSE:", juspayResponse);

//     return res.json({
//       success: true,
//       order_id,
//       payment_url: juspayResponse.payment_links?.web,
//     });
//   } catch (err) {
//     console.error("WALLET TOPUP ERROR →", err);

//     return res.status(500).json({
//       success: false,
//       message: "Wallet topup failed",
//     });
//   }
// };


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



/////// current one ////
// exports.verifyWalletTopup = async (req, res) => {
//   try {
//     const order_id = req.query.order_id || req.body.order_id;

//     if (!order_id) {
//       return res.status(400).json({ message: "order_id required" });
//     }

//     const txn = await WalletTransaction.findOne({ where: { order_id } });

//     if (!txn) {
//       return res.status(404).json({ message: "Transaction not found" });
//     }

//     // 🔐 Prevent double credit
//     if (txn.status === "SUCCESS") {
//       return res.redirect(
//         `${process.env.FRONTEND_URL}/wallet-success?order_id=${order_id}`
//       );
//     }

//     const statusResp = await juspay.order.status(order_id);

//     if (statusResp.status === "CHARGED") {
//       txn.status = "SUCCESS";
//       txn.payment_txn_id = statusResp.txn_id || statusResp.payment_id || null;
//       await txn.save();

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

/// test 20 feb .///
// exports.verifyWalletTopup = async (req, res) => {
//   try {
//     console.log("==================================");
//     console.log("🚀 VERIFY WALLET TOPUP HIT");
//     console.log("FULL QUERY:", req.query);
//     console.log("FULL BODY:", req.body);
//     console.log("==================================");

//     // 🔎 Extract order_id from all possible Juspay fields
//     // const order_id =
//     //   req.query.order_id ||
//     //   req.query.orderId ||
//     //   req.query.merchant_order_id ||
//     //   req.body.order_id ||
//     //   req.body.orderId ||
//     //   req.body.merchant_order_id;

//     // console.log("🆔 EXTRACTED ORDER_ID:", order_id);

//     let order_id =
//       req.query.order_id ||
//       req.query.orderId ||
//       req.query.merchant_order_id ||
//       req.body.order_id ||
//       req.body.orderId ||
//       req.body.merchant_order_id;

//     // 🔥 FIX: Handle comma-separated order_id
//     if (order_id && order_id.includes(",")) {
//       order_id = order_id.split(",")[0].trim();
//     }

//     console.log("🆔 CLEANED ORDER_ID:", order_id);

//     if (!order_id) {
//       console.log("❌ ORDER_ID NOT FOUND IN REQUEST");
//       return res.status(400).json({ message: "order_id required" });
//     }

//     // 🔎 Find transaction in DB
//     const txn = await WalletTransaction.findOne({ where: { order_id } });

//     console.log("📦 DB TRANSACTION RESULT:", txn);

//     if (!txn) {
//       console.log("❌ TRANSACTION NOT FOUND IN DB");
//       return res.status(404).json({ message: "Transaction not found" });
//     }

//     // 🔐 Prevent double credit
//     if (txn.status === "SUCCESS") {
//       console.log("✅ TRANSACTION ALREADY SUCCESS, REDIRECTING");
//       return res.redirect(
//         `${process.env.FRONTEND_URL}/wallet-success?order_id=${order_id}`
//       );
//     }

//     // 🔎 Check payment status from Juspay
//     console.log("🔍 CHECKING JUSPAY STATUS...");
//     const statusResp = await juspay.order.status(order_id);

//     console.log("💳 JUSPAY STATUS RESPONSE:", statusResp);

//     if (statusResp.status === "CHARGED") {
//       console.log("✅ PAYMENT CHARGED, UPDATING DB...");

//       txn.status = "SUCCESS";
//       txn.payment_txn_id = statusResp.txn_id || statusResp.payment_id || null;
//       await txn.save();

//       let wallet = await TechnicianWallet.findOne({
//         where: { technician_id: txn.technician_id },
//       });

//       if (!wallet) {
//         console.log("⚠️ WALLET NOT FOUND, CREATING NEW");
//         wallet = await TechnicianWallet.create({
//           technician_id: txn.technician_id,
//           balance: 0,
//         });
//       }

//       wallet.balance = Number(wallet.balance) + Number(txn.amount);
//       await wallet.save();

//       console.log("💰 WALLET UPDATED. NEW BALANCE:", wallet.balance);

//       return res.redirect(
//         `${process.env.FRONTEND_URL}/wallet-success?order_id=${order_id}`
//       );
//     }

//     console.log("❌ PAYMENT FAILED, MARKING FAILED");

//     txn.status = "FAILED";
//     await txn.save();

//     return res.redirect(
//       `${process.env.FRONTEND_URL}/wallet-failed?order_id=${order_id}`
//     );
//   } catch (err) {
//     console.error("🔥 VERIFY WALLET ERROR →", err);
//     return res.status(500).json({ message: "Verification failed" });
//   }
// };



// exports.verifyWalletTopup = async (req, res) => {
//   try {
//     let order_id =
//       req.query.order_id ||
//       req.query.orderId ||
//       req.query.merchant_order_id ||
//       req.body.order_id ||
//       req.body.orderId ||
//       req.body.merchant_order_id;

//     if (!order_id) {
//       return res.status(400).json({ message: "order_id required" });
//     }

//     // ✅ FIX: Remove duplicate order_ids from Juspay
//     if (order_id.includes(",")) {
//       order_id = order_id.split(",")[0].trim();
//     }

//     console.log("FINAL ORDER_ID:", order_id);

//     const txn = await WalletTransaction.findOne({
//       where: { order_id },
//     });

//     if (!txn) {
//       return res.status(404).json({
//         message: "Transaction not found",
//         order_id,
//       });
//     }

//     // Prevent double credit
//     if (txn.status === "SUCCESS") {
//       return res.redirect(
//         `${process.env.FRONTEND_URL}/wallet-success?order_id=${order_id}`
//       );
//     }

//     const statusResp = await juspay.order.status(order_id);

//     if (statusResp.status === "CHARGED") {
//       txn.status = "SUCCESS";
//       txn.payment_txn_id = statusResp.txn_id || statusResp.payment_id || null;

//       await txn.save();

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

//     txn.status = "FAILED";
//     await txn.save();

//     return res.redirect(
//       `${process.env.FRONTEND_URL}/wallet-failed?order_id=${order_id}`
//     );
//   } catch (err) {
//     console.error("VERIFY ERROR:", err);
//     return res.status(500).json({
//       message: "Verification failed",
//     });
//   }
// };





/// working properly ///
exports.verifyWalletTopup = async (req, res) => {
  try {
    let order_id =
      req.query.order_id ||
      req.query.orderId ||
      req.query.merchant_order_id ||
      req.body.order_id ||
      req.body.orderId ||
      req.body.merchant_order_id;

    if (!order_id) {
      return res.status(400).json({ message: "order_id required" });
    }

    // Fix duplicate order_id
    if (order_id.includes(",")) {
      order_id = order_id.split(",")[0].trim();
    }

    const txn = await WalletTransaction.findOne({
      where: { order_id },
    });

    if (!txn) {
      return res.status(404).json({
        message: "Transaction not found",
        order_id,
      });
    }

    const statusResp = await juspay.order.status(order_id);

    if (statusResp.status === "CHARGED") {
      if (txn.status !== "SUCCESS") {
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
      }

      // If request comes from browser/Juspay → redirect
      if (req.headers.accept && req.headers.accept.includes("text/html")) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/wallet-success?order_id=${order_id}`
        );
      }

      // If request comes from Swagger/API → JSON
      return res.json({
        success: true,
        order_id,
        status: "SUCCESS",
      });
    }

    txn.status = "FAILED";
    await txn.save();

    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/wallet-failed?order_id=${order_id}`
      );
    }

    return res.json({
      success: false,
      order_id,
      status: "FAILED",
    });
  } catch (err) {
    console.error("VERIFY ERROR:", err);
    return res.status(500).json({
      message: "Verification failed",
    });
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



/// working code on 20 feb . /////

// exports.withdrawFromWallet = async (req, res) => {
//   const t = await db.sequelize.transaction();

//   try {
//     const { technician_id, amount } = req.body;

//     if (!technician_id || !amount || amount <= 0) {
//       await t.rollback();
//       return res.status(400).json({
//         message: "technician_id and valid amount are required",
//       });
//     }

//     const wallet = await TechnicianWallet.findOne({
//       where: { technician_id },
//       transaction: t,
//       lock: t.LOCK.UPDATE,
//     });

//     if (!wallet || Number(wallet.balance) < Number(amount)) {
//       await t.rollback();
//       return res.status(400).json({
//         message: "Insufficient wallet balance",
//       });
//     }

//     // Deduct balance
//     wallet.balance = Number(wallet.balance) - Number(amount);
//     await wallet.save({ transaction: t });

//     // Create transaction record
//     await WalletTransaction.create(
//       {
//         technician_id,
//         wallet_id: wallet.id,
//         amount,
//         type: "DEBIT", // ✅ enum-safe
//         source: "WITHDRAWAL", // ✅ must exist in DB enum
//         status: "PENDING",
//       },
//       { transaction: t }
//     );

//     await t.commit();

//     return res.json({
//       success: true,
//       message: "Withdrawal initiated",
//       remainingBalance: wallet.balance,
//     });
//   } catch (error) {
//     await t.rollback();
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

    // Generate Withdrawal Order ID
    const order_id = `WD${Date.now()}`;

    // Deduct balance
    wallet.balance = Number(wallet.balance) - Number(amount);
    await wallet.save({ transaction: t });

    // Create transaction record
    await WalletTransaction.create(
      {
        technician_id,
        wallet_id: wallet.id,
        amount,
        order_id, // ✅ Added
        payment_txn_id: order_id, // ✅ Added
        type: "DEBIT",
        source: "WITHDRAW",
        status: "SUCCESS", // ✅ Changed from PENDING
      },
      { transaction: t }
    );

    await t.commit();

    return res.json({
      success: true,
      message: "Withdrawal successful",
      order_id,
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









































