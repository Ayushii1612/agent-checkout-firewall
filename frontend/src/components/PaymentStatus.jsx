function PaymentStatus({ payment }) {
  if (!payment) return null;

  const blocked = payment.status === 'blocked';
  return <article className={`result-card payment-card ${blocked ? 'is-blocked' : 'is-allowed'}`}><div className="card-label"><span className="card-icon">{blocked ? 'OFF' : 'ON'}</span><span>PAYMENT GATE</span></div><h3>{blocked ? 'Payment held' : 'Order created'}</h3><p>{blocked ? 'No payment was initiated. The claim failed verification before money could move.' : payment.demo ? 'Demo order created. Add Razorpay test keys to open a real test checkout.' : 'Verified order ready for Razorpay test-mode checkout.'}</p>{!blocked && <div className="order-detail"><span>{payment.orderId}</span><strong>Rs {(payment.amount / 100).toFixed(2)} {payment.currency}</strong></div>}</article>;
}

export default PaymentStatus;