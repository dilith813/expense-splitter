// All amounts stored as integer cents (LKR × 100) to avoid floating point
// Rs. 100.50 → 10050 internally

export const toLKRCents = (amount) => Math.round(parseFloat(amount) * 100);

export const fromLKRCents = (cents) => cents / 100;

export const formatLKR = (cents) => {
  const amount = fromLKRCents(Math.abs(cents));
  return `Rs. ${amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};
