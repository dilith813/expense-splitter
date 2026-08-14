// Greedy algorithm for minimum number of transactions to settle all debts
// 1. Compute net balance per person (paid - owed)
// 2. Split into creditors (+) and debtors (-)
// 3. Match largest debtor to largest creditor repeatedly

export const computeBalances = (people, expenses) => {
  const balances = {};
  people.forEach((p) => (balances[p.id] = 0));

  expenses.forEach((expense) => {
    // Payer gets credit for full amount
    balances[expense.paidBy] += expense.amount;
    // Each person in the split owes their share
    expense.splits.forEach(({ personId, amount }) => {
      balances[personId] -= amount;
    });
  });

  return balances; // positive = owed money back, negative = owes money
};

export const computeSettlements = (people, expenses) => {
  const balances = computeBalances(people, expenses);

  // Build mutable arrays of creditors and debtors
  const creditors = []; // { id, name, amount }
  const debtors = [];   // { id, name, amount }

  people.forEach((p) => {
    const bal = balances[p.id];
    if (bal > 0) creditors.push({ id: p.id, name: p.name, amount: bal });
    else if (bal < 0) debtors.push({ id: p.id, name: p.name, amount: -bal });
  });

  const transactions = [];

  // Greedy: always match largest debtor to largest creditor
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  let ci = 0;
  let di = 0;

  while (ci < creditors.length && di < debtors.length) {
    const credit = creditors[ci];
    const debt = debtors[di];
    const amount = Math.min(credit.amount, debt.amount);

    if (amount > 0) {
      transactions.push({
        from: debt.id,
        fromName: debt.name,
        to: credit.id,
        toName: credit.name,
        amount,
      });
    }

    credit.amount -= amount;
    debt.amount -= amount;

    if (credit.amount === 0) ci++;
    if (debt.amount === 0) di++;
  }

  return transactions;
};
