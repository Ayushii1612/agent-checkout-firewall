const Razorpay = require('razorpay');

const instance = process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET
  ? new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    })
  : null;

async function createOrder(amountInRupees, productName) {
  if (!instance) {
    return {
      id: `demo_order_${Date.now()}`,
      amount: Math.round(amountInRupees * 100),
      currency: 'INR',
      notes: { product: productName },
      demo: true
    };
  }

  const order = await instance.orders.create({
    amount: Math.round(amountInRupees * 100), // Razorpay expects paise
    currency: 'INR',
    receipt: `receipt_${Date.now()}`,
    notes: { product: productName }
  });
  return order;
}

module.exports = { createOrder };