# HDFC Payment Gateway Setup

Simple guide to set up HDFC SmartGateway for accepting payments.

---

## What You Need from HDFC Bank

Contact HDFC Bank and ask for **SmartGateway** merchant account. They will give you:

1. **Merchant ID** - Your unique ID (like a username)
2. **Secret Key** - For security (like a password)
3. **API Key** - For API access

That's it. Just these 3 things.

---

## How to Set Up

### Step 1: Create a file called `.env`

Go to `BHS_BackEnd` folder and create a new file. Name it exactly `.env` (with the dot).

### Step 2: Copy-paste this into the file

```
# Database (ask your developer for these)
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_NAME=bhs_database
DB_HOST=localhost

# HDFC Payment (put your credentials here)
HDFC_MERCHANT_ID=your_merchant_id
HDFC_SECRET_KEY=your_secret_key
HDFC_API_KEY=your_api_key

# Keep this as sandbox for testing
HDFC_ENVIRONMENT=sandbox

# Your website URLs (change localhost to your real domain later)
FRONTEND_URL=http://localhost:5173
```

### Step 3: Replace with your actual values

Example - if HDFC gave you:
- Merchant ID: `BHS123456`
- Secret Key: `sk_test_abcdef123456`
- API Key: `ak_test_xyz789`

Then your file should look like:

```
HDFC_MERCHANT_ID=BHS123456
HDFC_SECRET_KEY=sk_test_abcdef123456
HDFC_API_KEY=ak_test_xyz789
```

### Step 4: Start the server

Open terminal in `BHS_BackEnd` folder and run:

```
npm install
npm start
```

You should see:
```
✅ HDFC SmartGateway configured (sandbox mode)
```

If you see a warning about missing credentials, check your `.env` file again.

---

## Testing Payments

1. First test with `HDFC_ENVIRONMENT=sandbox`
2. Use test card numbers (HDFC will provide these)
3. Make sure payments work
4. Then change to `HDFC_ENVIRONMENT=production` for real payments

---

## Going Live (Production)

When ready for real payments, update your `.env`:

```
# Change sandbox to production
HDFC_ENVIRONMENT=production

# Change localhost to your real domain
FRONTEND_URL=https://yourwebsite.com
```

---

## How Payment Works

```
Customer clicks "Pay Now"
        ↓
Goes to HDFC payment page
        ↓
Enters card/UPI/netbanking details
        ↓
Payment processed
        ↓
Comes back to your website
        ↓
Shows success or failure message
```

---

## Common Problems

### "Missing configuration" error
→ Your `.env` file is missing or credentials are wrong

### Payment page not opening
→ Check if HDFC_MERCHANT_ID is correct

### Payment stuck on "pending"
→ Wait a few minutes, or check HDFC dashboard

### Callback not working
→ Make sure your server is running and accessible

---

## Important Security Rules

1. **Never share** your Secret Key with anyone
2. **Never commit** `.env` file to Git (it's already ignored)
3. **Test first** in sandbox before going live
4. **Keep credentials safe** - treat them like bank passwords

---

## Need Help?

- HDFC SmartGateway: https://smartgateway.hdfcbank.com/docs
- HDFC Support: Contact through your merchant dashboard

---

## Quick Checklist

Before going live, make sure:

- [ ] Got credentials from HDFC
- [ ] Created `.env` file with correct values
- [ ] Tested payments in sandbox mode
- [ ] All test payments working
- [ ] Changed to production mode
- [ ] Updated website URLs to real domain
