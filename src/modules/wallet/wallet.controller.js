const db = require("../../../models");
const juspay = require("../../../payments/juspay");

const TechnicianWallet = db.TechnicianWallet;
const WalletTransaction = db.WalletTransaction;

exports.createWalletTopup = async (req, res) => {
  try {
    const { technician_id, amount, email, mobile } = req.body;

    if (!technician_id || !amount || !email || !mobile || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "technician_id, amount, email, mobile are required",
      });
    }

    /* 1️⃣ FIND / CREATE WALLET */
    let wallet = await TechnicianWallet.findOne({
      where: { technician_id },
    });

    if (!wallet) {
      wallet = await TechnicianWallet.create({
        technician_id,
        balance: 0,
      });
    }

    /* 2️⃣ GENERATE ORDER ID (CONSISTENT FORMAT) */
    const order_id = `WL${Date.now()}`;

    /* 3️⃣ CREATE TRANSACTION */
    await WalletTransaction.create({
      technician_id,
      wallet_id: wallet.id,
      order_id,
      amount,
      type: "CREDIT",
      source: "TOPUP",
      status: "PENDING",
    });

    /* 4️⃣ CREATE JUSPAY ORDER */
    const juspayResponse = await juspay.order.create({
      order_id,
      amount: Number(amount).toFixed(2),
      currency: "INR",
      customer_id: String(technician_id),
      customer_email: email,
      customer_phone: mobile,
      return_url: `${process.env.BASE_URL}/api/payment/juspay/redirect?order_id=${order_id}`,
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

exports.getWalletBalance = async (req, res) => {
  const wallet = await db.TechnicianWallet.findOne({
    where: { technician_id: req.params.technicianId },
  });

  res.json({ balance: wallet ? wallet.balance : 0 });
};

exports.getWalletTransactions = async (req, res) => {
  const transactions = await db.WalletTransaction.findAll({
    where: { technician_id: req.params.technicianId },
    order: [["createdAt", "DESC"]],
  });

  res.json(transactions);
};
