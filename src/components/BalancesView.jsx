import { computeBalances } from '../utils/settleUp';
import { formatLKR } from '../utils/currency';

export default function BalancesView({ people, expenses }) {
  if (people.length === 0) return null;

  const balances = computeBalances(people, expenses);
  const balanceSum = Object.values(balances).reduce((s, b) => s + b, 0);

  // Max absolute balance for bar scaling
  const maxAbs = Math.max(...Object.values(balances).map(Math.abs), 1);

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
              const pct = Math.round((Math.abs(bal) / maxAbs) * 100);

              return (
                <li key={p.id} className="balance-item">
                  <div className="balance-top">
                    <div className="balance-left">
                      <span className="person-avatar">{p.name[0].toUpperCase()}</span>
                      <span className="balance-name">{p.name}</span>
                    </div>
                    <span className={`balance-amount ${isZero ? 'zero' : isPositive ? 'positive' : 'negative'}`}>
                      {isZero
                        ? 'Settled'
                        : isPositive
                        ? `+${formatLKR(bal)}`
                        : `−${formatLKR(-bal)}`}
                    </span>
                  </div>
                  {!isZero && (
                    <div className="balance-bar-track">
                      <div
                        className={`balance-bar ${isPositive ? 'bar-positive' : 'bar-negative'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="reconcile-note">
            {balanceSum === 0
              ? '✓ Balances reconcile to zero'
              : `⚠ Rounding drift: ${balanceSum} paise`}
          </p>
        </>
      )}
    </div>
  );
}