# Expense Splitter

A single-session expense splitting app for groups. Add people, log expenses, and find out who owes whom — with the fewest payments possible.

Built with React + Vite. All amounts in Sri Lankan Rupees (LKR).

---

## How to Run

**Prerequisites:** Node.js v18+

```bash
git clone https://github.com/dilith813/expense-splitter.git
cd expense-splitter
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Features

- Add any number of people to a group
- Log expenses with:
  - **Equal split** among selected people
  - **Percentage split** among selected people (validates to 100%)
- Edit or delete any expense — balances recalculate instantly
- Running balances view showing net owed/owes per person
- Settle Up screen showing the **minimum number of transactions** to zero everyone out
- Data persists across page refreshes via localStorage

---

## Assumptions & Decisions

### Persistence — localStorage
Chose localStorage over in-memory state. A trip expense tracker is realistically used across multiple browser sessions (adding expenses over several days), so losing data on refresh would be a poor experience. localStorage requires no backend, no setup, and fits the "single-session tool" spirit while being more practical. Data is keyed under `esp_people` and `esp_expenses`.

### Currency — Integer paise storage
All amounts are stored internally as **integer cents (LKR × 100)** to avoid floating point arithmetic entirely. Rs. 100.50 is stored as `10050`. All calculations operate on integers. Display conversion happens only at render time via `formatLKR()`.

This means there is no floating point drift anywhere in the split or settle-up logic.

### Rounding — Largest remainder method
When a total doesn't divide evenly, we use the **largest remainder method** to distribute the leftover cents:

1. Floor-divide the total by the number of people
2. Calculate the remainder (total − sum of floors)
3. Distribute one extra cent to the first N people (or the N people with the largest fractional remainders, for percentage splits)

**Example:** Rs. 100 split 3 ways → `[34, 33, 33]`, not `[33.33, 33.33, 33.33]`

The sum of all split amounts always equals the exact total. The reconciliation check on the Balances screen confirms this — it shows "✓ Balances reconcile to zero" after every calculation.

### Settle Up — Optimal minimum-transactions algorithm

The app computes settlements using a recursive search that finds the true minimum number of transactions needed to bring all balances to zero. At each step, it selects a debtor and tries settling them against each possible creditor, recursively exploring the resulting states and keeping the shortest valid solution. Zero-balance people are excluded, and an exact integer-cent representation ensures settlement amounts reconcile precisely. This approach is appropriate for the expected small group sizes; a larger-scale application could use additional memoization or state-compression optimizations.

### Split types — Equal and Percentage
Chose percentage over exact-amount as the second split type. Percentage is more commonly useful for real trips (covering someone's share, unequal contributions by agreement) and exercises the rounding logic more interestingly. Exact-amount split could be added as a third type with minimal changes to `splitCalculator.js`.

### Validation — Percentage splits
The form blocks submission if percentages don't sum to 100% (within 0.01% tolerance for float input). A live running total is shown as the user fills in values, turning green at exactly 100%.

### No login / no accounts
All state is local to the browser. No authentication, no server, no database. This is intentional per the spec.

---

## Sanity Check — Example Scenario

**People:** Alice, Bob, Carol, Dave

| # | Paid by | Amount | Split |
|---|---------|--------|-------|
| 1 | Alice | Rs. 12,000 | Equal — all 4 (Rs. 3,000 each) |
| 2 | Carol | Rs. 10,000 | Percentage — Alice 40%, Bob 30%, Dave 30% |
| 3 | Dave | Rs. 6,000 | Equal — Dave & Bob only (Rs. 3,000 each) |

**Expected net balances:**

| Person | Paid | Owes | Net |
|--------|------|------|-----|
| Alice | 12,000 | 3,000 + 4,000 = 7,000 | **+5,000** |
| Bob | 0 | 3,000 + 3,000 + 3,000 = 9,000 | **−9,000** |
| Carol | 10,000 | 3,000 = 3,000 | **+7,000** |
| Dave | 6,000 | 3,000 + 3,000 + 3,000 = 9,000 | **−3,000** |

Sum: 5,000 − 9,000 + 7,000 − 3,000 = **0 ✓**

**Settle Up (3 transactions):**
- Bob → Carol: Rs. 7,000
- Bob → Alice: Rs. 2,000
- Dave → Alice: Rs. 3,000

---

## What I'd Do Differently / Build Next

### With more time
- **Exact amount split** as a third split type alongside equal and percentage
- **Export to PDF or CSV** — useful for sending a summary to the group
- **Expense categories** (food, transport, accommodation) with a breakdown view
- **Multi-currency support** with a conversion layer, useful for international trips
- **Undo delete** instead of a bare `confirm()` dialog
- **Optimistic greedy vs. true minimum** — the greedy approach gives minimum transactions in practice but not always theoretically; a full optimal solver could be added for large groups

### UI improvements I'd make
- Transition animations between tabs
- Swipe-to-delete on mobile
- A summary banner at the top showing total group spend

### What I left incomplete
- **No unit tests** — the split calculator and settle-up algorithm are pure functions and would be straightforward to test with Vitest; skipped due to time
- **No exact-amount split** — percentage split was chosen as the required second type; exact-amount is a natural extension
- **No empty-state illustrations** — functional empty states are in place but plain text only

---

## Project Structure

```
src/
  components/
    PeopleManager.jsx     # Add/remove people
    ExpenseForm.jsx       # Add/edit expenses (equal + percentage split)
    ExpenseList.jsx       # Expense log with edit/delete
    BalancesView.jsx      # Net balances per person
    SettleUpView.jsx      # Minimum transactions to settle
  hooks/
    useLocalStorage.js    # Syncs React state to localStorage
  utils/
    currency.js           # Integer paise storage + LKR formatting
    splitCalculator.js    # Equal + percentage split with largest-remainder rounding
    settleUp.js           # Balance computation + greedy settle-up algorithm
  App.jsx                 # Root — state, routing between tabs
  main.jsx                # Entry point
  index.css               # All styles
```

---

## Tech Stack

- [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- Plain CSS (no UI library)
- No backend, no database