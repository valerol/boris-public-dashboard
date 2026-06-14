'use client';

import { useState } from 'react';

export default function HomePage() {
  const [message, setMessage] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function submit() {
    setLoading(true);
    setError('');
    setAnswer('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setAnswer(data.answer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="card">
        <p className="meta">BORIS Public Dashboard · MVP-0</p>
        <h1>BORIS</h1>
        <p>
          Ask a question and see how BORIS applies the public BOIS/BORIS core.
          This MVP does not store user archives or conversation content.
        </p>

        <textarea
          value={message}
          maxLength={10000}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask BORIS a question..."
        />

        <p className="meta">{message.length}/10000 characters · 10 requests/IP/day will be added in the next step.</p>

        <button onClick={submit} disabled={loading || message.trim().length === 0}>
          {loading ? 'Thinking...' : 'Ask BORIS'}
        </button>

        {error && <div className="output">Error: {error}</div>}
        {answer && <div className="output">{answer}</div>}
      </section>
    </main>
  );
}
