import Razorpay from 'razorpay';
import crypto  from 'crypto';
import env     from '../config/env.js';

let _instance = null;

function getInstance() {
  if (!_instance) {
    _instance = new Razorpay({
      key_id:     env.razorpayKeyId,
      key_secret: env.razorpayKeySecret,
    });
  }
  return _instance;
}

export function isRazorpayConfigured() {
  return Boolean(env.razorpayKeyId && env.razorpayKeySecret);
}

/**
 * Create a Razorpay order.
 * @param {object} opts
 * @param {number} opts.amount   - Amount in INR (rupees, not paise)
 * @param {string} opts.receipt  - Unique receipt id (e.g. eventId_userId)
 * @param {object} [opts.notes]  - Optional notes object
 * @returns {Promise<object>}    - Razorpay order object
 */
export async function createOrder({ amount, receipt, notes = {} }) {
  const rp = getInstance();
  return rp.orders.create({
    amount:   Math.round(amount * 100), // convert rupees → paise
    currency: 'INR',
    receipt,
    notes,
  });
}

/**
 * Verify Razorpay payment signature (HMAC-SHA256).
 * Returns true if the signature is valid.
 */
export function verifySignature({ orderId, paymentId, signature }) {
  const body     = `${orderId}|${paymentId}`;
  const expected = crypto
    .createHmac('sha256', env.razorpayKeySecret)
    .update(body)
    .digest('hex');
  return expected === signature;
}
