import { useState } from 'react';

export default function PeopleManager({ people, onAdd, onRemove }) {
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (people.some((p) => p.name.toLowerCase() === trimmed.toLowerCase())) {
      setError('Someone with that name is already in the group.');
      return;
    }
    onAdd(trimmed);
    setName('');
    setError('');
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') handleAdd();
  };

  return (
    <div className="card">
      <h2>People</h2>

      <div className="input-row">
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => { setName(e.target.value); setError(''); }}
          onKeyDown={handleKey}
          maxLength={40}
        />
        <button onClick={handleAdd} className="btn-primary">Add</button>
      </div>
      {error && <p className="error">{error}</p>}

      {people.length === 0 ? (
        <p className="empty">Add at least two people to get started.</p>
      ) : (
        <ul className="people-list">
          {people.map((p) => (
            <li key={p.id}>
              <span className="person-avatar">{p.name[0].toUpperCase()}</span>
              <span className="person-name">{p.name}</span>
              <button
                className="btn-ghost btn-remove"
                onClick={() => onRemove(p.id)}
                title="Remove person"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
