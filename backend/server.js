require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { runAgent } = require('./agent');
const { verifyProposal } = require('./verifier');
const { createOrder } = require('./razorpay');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.post('/api/purchase', async (req, res) => {
  try {
    const { query, scenario } = req.body;
    if (!query) return res.status(400).json({ error: 'query is required' });

    const proposal = await runAgent(query, scenario || 'correct');
    const verification = verifyProposal(proposal);

    let payment;
    if (verification.allowed) {
      const order = await createOrder(verification.groundTruth.price, verification.groundTruth.name);
      payment = { status: 'created', orderId: order.id, amount: order.amount, currency: order.currency, demo: order.demo || false };
    } else {
      payment = { status: 'blocked' };
    }

    res.json({ proposal, verification, payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));