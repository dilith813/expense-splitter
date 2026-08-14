import { useState } from 'react';
import { useLocalStorage } from './hooks/useLocalStorage';
import PeopleManager from './components/PeopleManager';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import BalancesView from './components/BalancesView';
import SettleUpView from './components/SettleUpView';

const TABS = ['Expenses', 'Balances', 'Settle Up'];

export default function App() {
  const [people, setPeople] = useLocalStorage('esp_people', []);
  const [expenses, setExpenses] = useLocalStorage('esp_expenses', []);
  const [activeTab, setActiveTab] = useState('Expenses');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const addPerson = (name) => {
    setPeople((prev) => [...prev, { id: crypto.randomUUID(), name }]);
  };

  const removePerson = (id) => {
    const hasExpenses = expenses.some(
      (e) => e.paidBy === id || e.splits.some((s) => s.personId === id)
    );
    if (hasExpenses) {
      alert('Cannot remove a person who is part of existing expenses. Delete those expenses first.');
      return;
    }
    setPeople((prev) => prev.filter((p) => p.id !== id));
  };

  const saveExpense = (expense) => {
    setExpenses((prev) => {
      const exists = prev.find((e) => e.id === expense.id);
      return exists
        ? prev.map((e) => (e.id === expense.id ? expense : e))
        : [...prev, expense];
    });
    setShowForm(false);
    setEditingExpense(null);
  };

  const deleteExpense = (id) => {
    if (!confirm('Delete this expense?')) return;
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const startEdit = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
    setActiveTab('Expenses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelForm = () => {
    setShowForm(false);
    setEditingExpense(null);
  };

  const canAddExpense = people.length >= 2;

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <h1>Expense Splitter</h1>
          <span className="header-currency">LKR</span>
        </div>
      </header>

      <main className="app-main">
        <div className="layout">
          {/* Left column — always visible */}
          <aside className="left-col">
            <PeopleManager people={people} onAdd={addPerson} onRemove={removePerson} />
          </aside>

          {/* Right column — tabbed content */}
          <div className="right-col">
            <nav className="tabs">
              {TABS.map((tab) => (
                <button
                  key={tab}
                  className={activeTab === tab ? 'tab active' : 'tab'}
                  onClick={() => { setActiveTab(tab); setShowForm(false); setEditingExpense(null); }}
                >
                  {tab}
                  {tab === 'Settle Up' && expenses.length > 0 && <span className="tab-badge" />}
                </button>
              ))}
            </nav>

            {activeTab === 'Expenses' && (
              <div>
                {showForm || editingExpense ? (
                  <ExpenseForm
                    people={people}
                    onSave={saveExpense}
                    onCancel={cancelForm}
                    editingExpense={editingExpense}
                  />
                ) : (
                  <div className="add-expense-bar">
                    <button
                      className="btn-primary btn-full"
                      onClick={() => setShowForm(true)}
                      disabled={!canAddExpense}
                      title={!canAddExpense ? 'Add at least 2 people first' : ''}
                    >
                      + Add Expense
                    </button>
                    {!canAddExpense && <p className="hint">Add at least 2 people to log an expense.</p>}
                  </div>
                )}
                <ExpenseList expenses={expenses} people={people} onEdit={startEdit} onDelete={deleteExpense} />
              </div>
            )}

            {activeTab === 'Balances' && <BalancesView people={people} expenses={expenses} />}
            {activeTab === 'Settle Up' && <SettleUpView people={people} expenses={expenses} />}
          </div>
        </div>
      </main>
    </div>
  );
}