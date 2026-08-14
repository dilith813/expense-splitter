import { formatLKR } from '../utils/currency';

export default function ExpenseList({ expenses, people, onEdit, onDelete }) {
  const personName = (id) => people.find((p) => p.id === id)?.name || 'Unknown';

  if (expenses.length === 0) {
    return (
      <div className="card">
        <h2>Expenses</h2>
        <p className="empty">No expenses yet. Add one above.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Expenses ({expenses.length})</h2>
      <ul className="expense-list">
        {expenses.map((exp) => (
          <li key={exp.id} className="expense-item">
            <div className="expense-main">
              <div className="expense-info">
                <span className="expense-description">{exp.description}</span>
                <span className="expense-meta">
                  Paid by <strong>{personName(exp.paidBy)}</strong>
                  {' · '}
                  <span className="split-type-badge">{exp.splitType}</span>
                </span>
                <div className="expense-splits">
                  {exp.splits.map(({ personId, amount }) => (
                    <span key={personId} className="split-chip">
                      {personName(personId)}: {formatLKR(amount)}
                    </span>
                  ))}
                </div>
              </div>
              <div className="expense-right">
                <span className="expense-amount">{formatLKR(exp.amount)}</span>
                <div className="expense-actions">
                  <button className="btn-ghost btn-sm" onClick={() => onEdit(exp)}>Edit</button>
                  <button className="btn-ghost btn-sm btn-danger" onClick={() => onDelete(exp.id)}>Delete</button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
