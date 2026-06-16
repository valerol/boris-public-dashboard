'use client';

import { useState } from 'react';

type BorisDepth = 'FAST' | 'NORMAL' | 'DEEP';
type BorisDemo = 'UNKNOWN_REGISTER' | 'SIMA_ANALYSIS' | 'DECISION_TRACE';

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
  demo?: BorisDemo;
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

const demoDescriptions: Record<BorisDemo, { title: string; subtitle: string; sample: string }> = {
  UNKNOWN_REGISTER: {
    title: 'Unknown Register',
    subtitle: 'Shows what BORIS refuses to fake: unknowns, assumptions, and missing evidence.',
    sample: 'Should I launch an online store for elephant pants in Russia?',
  },
  SIMA_ANALYSIS: {
    title: 'SIMA Analysis',
    subtitle: 'Shows decomposition: goal, system parts, dependencies, risks, and failure point.',
    sample: 'Why is my online store not growing, and what part of the system should I fix first?',
  },
  DECISION_TRACE: {
    title: 'Why BORIS answered this way',
    subtitle: 'Shows an audit-style trace of protocols without exposing hidden chain-of-thought.',
    sample: 'Should I increase sales at any cost, or optimize for profit first?',
  },
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
  const [demo, setDemo] = useState<BorisDemo>('UNKNOWN_REGISTER');
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
        body: JSON.stringify({ message, depth, demo }),
      });

      const data = (await response.json()) as ChatResponse;

      if (data.creditLimit) {
        setCreditLimit(data.creditLimit);
      }

      if (data.runtime) {
        setRuntimeText(
          `Runtime core: ${data.runtime.runtimeCoreChars}/${data.runtime.fullCoreChars} characters · ${data.depth || depth} mode · ${demoDescriptions[data.demo || demo].title}`
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

  function useSamplePrompt(selectedDemo: BorisDemo) {
    setDemo(selectedDemo);
    setMessage(demoDescriptions[selectedDemo].sample);
    setAnswer('');
    setError('');
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

        <div className="demoIntro">
          <span>2–3 minute BORIS demo</span>
          <strong>Unknown Register → SIMA Analysis → Decision Trace</strong>
        </div>

        <div className="demoSelector" aria-label="BORIS demonstration focus">
          {(['UNKNOWN_REGISTER', 'SIMA_ANALYSIS', 'DECISION_TRACE'] as BorisDemo[]).map((option, index) => (
            <button
              key={option}
              type="button"
              className={demo === option ? 'demoButton active' : 'demoButton'}
              onClick={() => setDemo(option)}
            >
              <span className="demoNumber">{index + 1}</span>
              <strong>{demoDescriptions[option].title}</strong>
              <span>{demoDescriptions[option].subtitle}</span>
            </button>
          ))}
        </div>

        <div className="samplePromptRow">
          {(['UNKNOWN_REGISTER', 'SIMA_ANALYSIS', 'DECISION_TRACE'] as BorisDemo[]).map((option) => (
            <button key={option} type="button" className="sampleButton" onClick={() => useSamplePrompt(option)}>
              Use {demoDescriptions[option].title} sample
            </button>
          ))}
        </div>

        <div className="creditPanel" aria-live="polite">
          <div>
            <span className="creditLabel">Demo focus</span>
            <strong>{demoDescriptions[demo].title}</strong>
          </div>
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
          {loading ? 'Thinking...' : `Run ${demoDescriptions[demo].title} · ${depth} · ${depthCosts[depth]} credits`}
        </button>

        {error && <div className="output">Error: {error}</div>}
        {answer && <div className="output">{answer}</div>}
      </section>
    </main>
  );
}
