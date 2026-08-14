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

  // Build name lookup
  const nameOf = {};
  people.forEach((p) => (nameOf[p.id] = p.name));

  // Filter to non-zero balances only
  const nonZero = people
    .map((p) => ({ id: p.id, amount: balances[p.id] }))
    .filter((p) => p.amount !== 0);

  if (nonZero.length === 0) return [];

  // Recursive optimal solver — finds true minimum number of transactions.
  // Group sizes are small in practice so recursion is fast enough.
  let best = [];

  const solve = (balances, current) => {
    const active = balances.filter((b) => b.amount !== 0);
    if (active.length === 0) {
      if (best.length === 0 || current.length < best.length) {
        best = [...current];
      }
      return;
    }

    // Prune: already as long as best, can't improve
    if (best.length > 0 && current.length >= best.length - 1) return;

    // Pick first debtor and try settling against every creditor
    const debtor = active.find((b) => b.amount < 0);
    if (!debtor) return;

    const creditors = active.filter((b) => b.amount > 0);
    for (const creditor of creditors) {
      const amount = Math.min(-debtor.amount, creditor.amount);
      const next = balances.map((b) => {
        if (b.id === debtor.id) return { ...b, amount: b.amount + amount };
        if (b.id === creditor.id) return { ...b, amount: b.amount - amount };
        return b;
      });
      solve(next, [
        ...current,
        {
          from: debtor.id,
          fromName: nameOf[debtor.id],
          to: creditor.id,
          toName: nameOf[creditor.id],
          amount,
        },
      ]);
    }
  };

  solve(nonZero, []);
  return best;
};
