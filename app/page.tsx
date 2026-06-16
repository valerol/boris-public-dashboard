'use client';

import { useState } from 'react';

type BorisDepth = 'FAST' | 'NORMAL' | 'DEEP';

type CreditLimit = {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
  cost: number;
  resetAt: number;
};

type ChatResponse = {
  answer?: string;
  error?: string;
  depth?: BorisDepth;
  creditLimit?: CreditLimit;
  runtime?: {
    fullCoreChars: number;
    runtimeCoreChars: number;
  };
};

const depthDescriptions: Record<BorisDepth, string> = {
  FAST: 'Short answer, critical unknowns, lowest token use.',
  NORMAL: 'Balanced BORIS answer with unknowns and compact SIMA checks.',
  DEEP: 'Richer analysis with unknowns, SIMA, trace, and physiology markers.',
};

const depthCosts: Record<BorisDepth, number> = {
  FAST: 1,
  NORMAL: 2,
  DEEP: 4,
};

const DAILY_CREDIT_LIMIT = 20;

function formatCreditText(creditLimit?: CreditLimit): string {
  if (!creditLimit) {
    return `${DAILY_CREDIT_LIMIT} credits/IP/day`;
  }

  return `${creditLimit.remaining}/${creditLimit.limit} credits remaining today`;
}

export default function HomePage() {
  const [message, setMessage] = useState('');
  const [depth, setDepth] = useState<BorisDepth>('NORMAL');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creditLimit, setCreditLimit] = useState<CreditLimit | undefined>();
  const [runtimeText, setRuntimeText] = useState('');

  async function submit() {
    setLoading(true);
    setError('');
    setAnswer('');
    setRuntimeText('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, depth }),
      });

      const data = (await response.json()) as ChatResponse;

      if (data.creditLimit) {
        setCreditLimit(data.creditLimit);
      }

      if (data.runtime) {
        setRuntimeText(
          `Runtime core: ${data.runtime.runtimeCoreChars}/${data.runtime.fullCoreChars} characters · ${data.depth || depth} mode`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setAnswer(data.answer || 'No answer returned.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <section className="card">
        <p className="meta">BORIS Public Dashboard · MVP-1</p>
        <h1>BORIS</h1>
        <p>
          Ask a question and see how BORIS applies the public BOIS/BORIS core.
          This MVP does not store user archives or conversation content.
        </p>

        <div className="creditPanel" aria-live="polite">
          <div>
            <span className="creditLabel">Selected mode</span>
            <strong>{depth}</strong>
          </div>
          <div>
            <span className="creditLabel">Cost</span>
            <strong>{depthCosts[depth]} credits</strong>
          </div>
          <div>
            <span className="creditLabel">Budget</span>
            <strong>{formatCreditText(creditLimit)}</strong>
          </div>
        </div>

        <div className="depthSelector" aria-label="BORIS depth mode">
          {(['FAST', 'NORMAL', 'DEEP'] as BorisDepth[]).map((option) => (
            <button
              key={option}
              type="button"
              className={depth === option ? 'depthButton active' : 'depthButton'}
              onClick={() => setDepth(option)}
            >
              <span className="depthButtonHeader">
                <strong>{option}</strong>
                <em>{depthCosts[option]} credit{depthCosts[option] > 1 ? 's' : ''}</em>
              </span>
              <span>{depthDescriptions[option]}</span>
            </button>
          ))}
        </div>

        <textarea
          value={message}
          maxLength={10000}
          onChange={(event) => setMessage(event.target.value)}
          placeholder="Ask BORIS a question..."
        />

        <p className="meta">
          {message.length}/10000 characters · {formatCreditText(creditLimit)}
          {runtimeText ? ` · ${runtimeText}` : ''}
        </p>

        <button className="primaryButton" onClick={submit} disabled={loading || message.trim().length === 0}>
          {loading ? 'Thinking...' : `Ask BORIS · ${depth} · ${depthCosts[depth]} credits`}
        </button>

        {error && <div className="output">Error: {error}</div>}
        {answer && <div className="output">{answer}</div>}
      </section>
    </main>
  );
}
