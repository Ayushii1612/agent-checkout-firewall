const db = require('./db');

function verifyProposal(proposal) {
  if (!proposal || proposal.error || !proposal.product_id) {
    return { allowed: false, reason: 'Agent did not produce a valid proposal.' };
  }

  const truth = db.prepare('SELECT * FROM products WHERE id = ?').get(proposal.product_id);

  if (!truth) {
    return { allowed: false, reason: `Product ID ${proposal.product_id} does not exist in catalog.` };
  }

  const mismatches = [];

  if (Number(proposal.claimed_price) !== Number(truth.price)) {
    mismatches.push(`Price mismatch: agent claimed ₹${proposal.claimed_price}, actual is ₹${truth.price}`);
  }
  if (Number(proposal.claimed_stock) !== Number(truth.stock)) {
    mismatches.push(`Stock mismatch: agent claimed ${proposal.claimed_stock} units, actual is ${truth.stock}`);
  }
  if (proposal.product_name?.trim() !== truth.name.trim()) {
    mismatches.push(`Product mismatch: agent selected "${proposal.product_name}", actual is "${truth.name}"`);
  }
  if (truth.stock <= 0) {
    mismatches.push(`Product is out of stock.`);
  }
  if (proposal.claimed_spec && proposal.claimed_spec.trim() !== truth.spec.trim()) {
    mismatches.push(`Spec mismatch: agent claimed "${proposal.claimed_spec}", actual is "${truth.spec}"`);
  }
  if (proposal.claimed_variant && proposal.claimed_variant.trim() !== truth.variant.trim()) {
    mismatches.push(`Variant mismatch: agent claimed "${proposal.claimed_variant}", actual is "${truth.variant}"`);
  }

  if (mismatches.length > 0) {
    return { allowed: false, reason: mismatches.join(' | '), groundTruth: truth };
  }

  return { allowed: true, reason: 'All claims verified against catalog. Safe to proceed.', groundTruth: truth };
}

module.exports = { verifyProposal };