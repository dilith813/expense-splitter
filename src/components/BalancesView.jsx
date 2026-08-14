import { computeBalances } from '../utils/settleUp';
import { formatLKR } from '../utils/currency';

export default function BalancesView({ people, expenses }) {
  if (people.length === 0) return null;

  const balances = computeBalances(people, expenses);

  // Sanity check: sum of all balances should be 0
  const balanceSum = Object.values(balances).reduce((s, b) => s + b, 0);

  return (
    <div className="card">
      <h2>Balances</h2>
      {expenses.length === 0 ? (
        <p className="empty">Add expenses to see balances.</p>
      ) : (
        <>
          <ul className="balance-list">
            {people.map((p) => {
              const bal = balances[p.id];
              const isPositive = bal > 0;
              const isZero = bal === 0;
              return (
                <li key={p.id} className="balance-item">
                  <span className="person-avatar">{p.name[0].toUpperCase()}</span>
                  <span className="balance-name">{p.name}</span>
                  <span className={`balance-amount ${isZero ? 'zero' : isPositive ? 'positive' : 'negative'}`}>
                    {isZero
                      ? 'Settled'
                      : isPositive
                      ? `gets back ${formatLKR(bal)}`
                      : `owes ${formatLKR(-bal)}`}
                  </span>
                </li>
              );
            })}
          </ul>
          {/* Debug reconciliation check - always visible for transparency */}
          <p className="reconcile-note">
            {balanceSum === 0
              ? '✓ Balances reconcile to zero'
              : `⚠ Rounding drift: ${balanceSum} paise (bug)`}
          </p>
        </>
      )}
    </div>
  );
}
