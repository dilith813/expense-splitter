import { useState, useEffect } from 'react';
import { toLKRCents } from '../utils/currency';
import {
  calculateEqualSplit,
  calculatePercentageSplit,
  validatePercentages,
} from '../utils/splitCalculator';

const emptyForm = (people) => ({
  description: '',
  amount: '',
  paidBy: people[0]?.id || '',
  splitType: 'equal',
  selectedPeople: people.map((p) => p.id),
  percentages: Object.fromEntries(people.map((p) => [p.id, ''])),
});

export default function ExpenseForm({ people, onSave, onCancel, editingExpense }) {
  const [form, setForm] = useState(() =>
    editingExpense ? formFromExpense(editingExpense, people) : emptyForm(people)
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!editingExpense) {
      setForm(emptyForm(people));
    }
  }, [people]);

  const validate = () => {
    const errs = {};
    if (!form.description.trim()) errs.description = 'Description is required.';
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) errs.amount = 'Enter a valid amount.';
    if (!form.paidBy) errs.paidBy = 'Select who paid.';
    if (form.selectedPeople.length === 0) errs.split = 'Select at least one person to split with.';

    if (form.splitType === 'percentage') {
      const selectedPercentages = form.selectedPeople.map((id) => ({
        personId: id,
        percentage: parseFloat(form.percentages[id] || 0),
      }));
      const allFilled = selectedPercentages.every((s) => !isNaN(s.percentage) && s.percentage > 0);
      if (!allFilled) errs.split = 'Enter a percentage for each person.';
      else if (!validatePercentages(selectedPercentages.map((s) => ({ percentage: s.percentage })))) {
        errs.split = `Percentages must add up to 100%. Currently: ${selectedPercentages.reduce((s, p) => s + p.percentage, 0).toFixed(1)}%`;
      }
    }

    return errs;
  };

  const handleSubmit = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    const totalCents = toLKRCents(form.amount);
    let splits;

    if (form.splitType === 'equal') {
      splits = calculateEqualSplit(totalCents, form.selectedPeople);
    } else {
      splits = calculatePercentageSplit(
        totalCents,
        form.selectedPeople.map((id) => ({
          personId: id,
          percentage: parseFloat(form.percentages[id]),
        }))
      );
    }

    onSave({
      id: editingExpense?.id || crypto.randomUUID(),
      description: form.description.trim(),
      amount: totalCents,
      paidBy: form.paidBy,
      splitType: form.splitType,
      splits,
      createdAt: editingExpense?.createdAt || Date.now(),
    });
  };

  const togglePerson = (id) => {
    setForm((f) => ({
      ...f,
      selectedPeople: f.selectedPeople.includes(id)
        ? f.selectedPeople.filter((pid) => pid !== id)
        : [...f.selectedPeople, id],
    }));
    setErrors((e) => ({ ...e, split: undefined }));
  };

  const setPercentage = (id, val) => {
    setForm((f) => ({ ...f, percentages: { ...f.percentages, [id]: val } }));
    setErrors((e) => ({ ...e, split: undefined }));
  };

  const selectedTotal = form.splitType === 'percentage'
    ? form.selectedPeople.reduce((sum, id) => sum + parseFloat(form.percentages[id] || 0), 0)
    : null;

  return (
    <div className="card">
      <h2>{editingExpense ? 'Edit Expense' : 'Add Expense'}</h2>

      <div className="form-group">
        <label>Description</label>
        <input
          type="text"
          placeholder="e.g. Dinner at Cinnamon Grand"
          value={form.description}
          onChange={(e) => { setForm((f) => ({ ...f, description: e.target.value })); setErrors((e) => ({ ...e, description: undefined })); }}
          maxLength={80}
        />
        {errors.description && <p className="error">{errors.description}</p>}
      </div>

      <div className="form-group">
        <label>Amount (LKR)</label>
        <input
          type="number"
          placeholder="0.00"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(e) => { setForm((f) => ({ ...f, amount: e.target.value })); setErrors((e) => ({ ...e, amount: undefined })); }}
        />
        {errors.amount && <p className="error">{errors.amount}</p>}
      </div>

      <div className="form-group">
        <label>Paid by</label>
        <select
          value={form.paidBy}
          onChange={(e) => setForm((f) => ({ ...f, paidBy: e.target.value }))}
        >
          {people.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
        {errors.paidBy && <p className="error">{errors.paidBy}</p>}
      </div>

      <div className="form-group">
        <label>Split type</label>
        <div className="split-type-toggle">
          <button
            className={form.splitType === 'equal' ? 'active' : ''}
            onClick={() => setForm((f) => ({ ...f, splitType: 'equal' }))}
          >
            Equal
          </button>
          <button
            className={form.splitType === 'percentage' ? 'active' : ''}
            onClick={() => setForm((f) => ({ ...f, splitType: 'percentage' }))}
          >
            Percentage
          </button>
        </div>
      </div>

      <div className="form-group">
        <label>Split between</label>
        <div className="split-people">
          {people.map((p) => {
            const selected = form.selectedPeople.includes(p.id);
            return (
              <div key={p.id} className={`split-person-row ${selected ? 'selected' : ''}`}>
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => togglePerson(p.id)}
                  />
                  {p.name}
                </label>
                {form.splitType === 'percentage' && selected && (
                  <div className="pct-input">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      placeholder="0"
                      value={form.percentages[p.id] || ''}
                      onChange={(e) => setPercentage(p.id, e.target.value)}
                    />
                    <span>%</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {form.splitType === 'percentage' && form.selectedPeople.length > 0 && (
          <p className={`pct-total ${Math.abs(selectedTotal - 100) < 0.01 ? 'valid' : 'invalid'}`}>
            Total: {selectedTotal.toFixed(1)}% {Math.abs(selectedTotal - 100) < 0.01 ? '✓' : '(must equal 100%)'}
          </p>
        )}
        {errors.split && <p className="error">{errors.split}</p>}
      </div>

      <div className="form-actions">
        <button className="btn-primary" onClick={handleSubmit}>
          {editingExpense ? 'Save Changes' : 'Add Expense'}
        </button>
        <button className="btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

function formFromExpense(expense, people) {
  const percentages = {};
  expense.splits.forEach(({ personId, amount }) => {
    percentages[personId] = ((amount / expense.amount) * 100).toFixed(1);
  });
  return {
    description: expense.description,
    amount: (expense.amount / 100).toString(),
    paidBy: expense.paidBy,
    splitType: expense.splitType,
    selectedPeople: expense.splits.map((s) => s.personId),
    percentages,
  };
}
