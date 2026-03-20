
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


/// working properly  just 2 mar day ///
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

//     // Fix duplicate order_id
//     if (order_id.includes(",")) {
//       order_id = order_id.split(",")[0].trim();
//     }

//     const txn = await WalletTransaction.findOne({
//       where: { order_id },
//     });

//     if (!txn) {
//       return res.status(404).json({
//         message: "Transaction not found",
//         order_id,
//       });
//     }

//     const statusResp = await juspay.order.status(order_id);

//     if (statusResp.status === "CHARGED") {
//       if (txn.status !== "SUCCESS") {
//         txn.status = "SUCCESS";
//         txn.payment_txn_id = statusResp.txn_id || statusResp.payment_id || null;
//         await txn.save();

//         let wallet = await TechnicianWallet.findOne({
//           where: { technician_id: txn.technician_id },
//         });

//         if (!wallet) {
//           wallet = await TechnicianWallet.create({
//             technician_id: txn.technician_id,
//             balance: 0,
//           });
//         }

//         wallet.balance = Number(wallet.balance) + Number(txn.amount);

//         await wallet.save();
//       }

//       // If request comes from browser/Juspay → redirect
//       if (req.headers.accept && req.headers.accept.includes("text/html")) {
//         return res.redirect(
//           `${process.env.FRONTEND_URL}/wallet-success?order_id=${order_id}`
//         );
//       }

//       // If request comes from Swagger/API → JSON
//       return res.json({
//         success: true,
//         order_id,
//         status: "SUCCESS",
//       });
//     }

//     txn.status = "FAILED";
//     await txn.save();

//     if (req.headers.accept && req.headers.accept.includes("text/html")) {
//       return res.redirect(
//         `${process.env.FRONTEND_URL}/wallet-failed?order_id=${order_id}`
//       );
//     }

//     return res.json({
//       success: false,
//       order_id,
//       status: "FAILED",
//     });
//   } catch (err) {
//     console.error("VERIFY ERROR:", err);
//     return res.status(500).json({
//       message: "Verification failed",
//     });
//   }
// };




///////newly added 2 mar  ////

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
        txn.payment_txn_id =
          statusResp.txn_id || statusResp.payment_id || null;
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

        wallet.balance =
          Number(wallet.balance) + Number(txn.amount);

        await wallet.save();
      }

      // Detect Browser vs App
      const acceptHeader = req.headers.accept || "";
      const userAgent = req.headers["user-agent"] || "";

      const isBrowser = acceptHeader.includes("text/html");
      const isMobile =
        userAgent.includes("Android") ||
        userAgent.includes("iPhone") ||
        userAgent.includes("Mobile");

      // Mobile Browser → Simple Page
      if (isBrowser && isMobile) {
        return res.send(`
          <html>
            <head>
              <title>Payment Successful</title>
              <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
              <style>
                body {
                  margin:0;
                  font-family: Arial;
                  background:#020617;
                  color:white;
                  display:flex;
                  justify-content:center;
                  align-items:center;
                  height:100vh;
                  text-align:center;
                }
                .box {
                  padding:20px;
                }
                .success {
                  font-size:24px;
                  color:#10b981;
                  font-weight:bold;
                }
                .msg {
                  margin-top:10px;
                  color:#94a3b8;
                }
              </style>
            </head>
            <body>
              <div class="box">
                <div class="success">✅ Payment Successful</div>
                <div class="msg">You can return to the app</div>
              </div>
            </body>
          </html>
        `);
      }

      // Desktop Web → Redirect
      if (isBrowser) {
        return res.redirect(
          `${process.env.FRONTEND_URL}/wallet-success?order_id=${order_id}`
        );
      }

      // Mobile App → JSON
      return res.json({
        success: true,
        order_id,
        status: "SUCCESS",
      });
    }

    txn.status = "FAILED";
    await txn.save();

    const acceptHeader = req.headers.accept || "";

    if (acceptHeader.includes("text/html")) {
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









































