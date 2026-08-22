import { useState } from 'react';

const SCENARIOS = [
  { value: 'correct', label: 'Accurate claims - ALLOW path' },
  { value: 'wrong_price', label: 'Wrong price - BLOCK path' },
  { value: 'wrong_stock', label: 'Wrong stock claim - BLOCK path' },
  { value: 'wrong_spec', label: 'Hallucinated spec - BLOCK path' }
];

function ChatInput({ onSubmit, loading }) {
  const [query, setQuery] = useState('I need running shoes under 3000');
  const [scenario, setScenario] = useState('correct');

  function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim() || loading) return;
    onSubmit(query, scenario);
  }

  return (
    <form onSubmit={handleSubmit} className="request-form">
      <label htmlFor="shopping-request">YOUR REQUEST</label><div className="input-wrap"><span className="prompt-mark">&gt;</span><input id="shopping-request" type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="e.g. running shoes under 3000" /></div>
      <label htmlFor="scenario">DEMO SCENARIO</label><select id="scenario" value={scenario} onChange={(e) => setScenario(e.target.value)}>{SCENARIOS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select>
      <button type="submit" disabled={loading}>{loading ? 'VERIFYING CLAIMS...' : 'RUN CHECK  ->'}</button>
    </form>
  );
}

export default ChatInput;