// Largest-remainder method ensures splits always sum to exact total
// Example: Rs. 100 ÷ 3 → [34, 33, 33] not [33.33, 33.33, 33.33]

export const calculateEqualSplit = (totalCents, personIds) => {
  const n = personIds.length;
  const base = Math.floor(totalCents / n);
  const remainder = totalCents - base * n;

  // Distribute remainder cents one-by-one to the first `remainder` people
  return personIds.map((personId, i) => ({
    personId,
    amount: base + (i < remainder ? 1 : 0),
  }));
};

export const calculatePercentageSplit = (totalCents, splits) => {
  // splits: [{ personId, percentage }]
  // First pass: floor each share
  const rawShares = splits.map(({ personId, percentage }) => {
    const exact = (totalCents * percentage) / 100;
    const floor = Math.floor(exact);
    return { personId, floor, remainder: exact - floor };
  });

  const floorSum = rawShares.reduce((sum, s) => sum + s.floor, 0);
  const remainderCents = totalCents - floorSum;

  // Sort by largest remainder descending, distribute extra cents
  const sorted = [...rawShares]
    .map((s, i) => ({ ...s, originalIndex: i }))
    .sort((a, b) => b.remainder - a.remainder);

  const result = rawShares.map((s) => ({ personId: s.personId, amount: s.floor }));
  for (let i = 0; i < remainderCents; i++) {
    result[sorted[i].originalIndex].amount += 1;
  }

  return result;
};

export const validatePercentages = (splits) => {
  const total = splits.reduce((sum, s) => sum + parseFloat(s.percentage || 0), 0);
  return Math.abs(total - 100) < 0.01; // allow tiny float imprecision
};
