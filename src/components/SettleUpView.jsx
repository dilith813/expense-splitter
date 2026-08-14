import { computeSettlements } from '../utils/settleUp';
import { formatLKR } from '../utils/currency';

export default function SettleUpView({ people, expenses }) {
  if (people.length === 0 || expenses.length === 0) return null;

  const transactions = computeSettlements(people, expenses);

  return (
    <div className="card">
      <h2>Settle Up</h2>
      {transactions.length === 0 ? (
        <p className="empty settled">🎉 Everyone is settled up!</p>
      ) : (
        <>
          <p className="settle-subtitle">
            {transactions.length} payment{transactions.length !== 1 ? 's' : ''} needed to settle all debts
          </p>
          <ul className="settle-list">
            {transactions.map((t, i) => (
              <li key={i} className="settle-item">
                <div className="settle-arrow">
                  <span className="settle-from">{t.fromName}</span>
                  <span className="settle-icon">→</span>
                  <span className="settle-to">{t.toName}</span>
                </div>
                <span className="settle-amount">{formatLKR(t.amount)}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
