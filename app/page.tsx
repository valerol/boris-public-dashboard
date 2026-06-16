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
    subtitle: 'Finds critical unknowns, ranks risk, and proposes testable hypotheses instead of pretending certainty.',
    sample:
      'I run a small online business and want to choose the next growth step. Sales are steady but have stopped growing for the last few months. I know the product has some repeat buyers, the website gets regular traffic, and I have a limited budget for only one major move. I have already tried small discounts and a few social posts, but the result was weak. Help me understand which unknowns matter most, what hypotheses could explain the stagnation, and what information I should collect before deciding.',
  },
  SIMA_ANALYSIS: {
    title: 'SIMA Analysis',
    subtitle: 'Decomposes the system, checks dependencies, and identifies the most likely bottleneck.',
    sample:
      'I manage a service project that should become more profitable, but the system feels stuck. We have enough incoming requests, several people are working on delivery, and customers are generally satisfied, yet the final profit is almost unchanged. We have already tried working faster and taking more requests, but that created more coordination problems. I need to see the system as parts, find the most likely constraint, and understand what should be changed first.',
  },
  DECISION_TRACE: {
    title: 'Why BORIS answered this way',
    subtitle: 'Shows the decision path, assumptions, evidence checks, and protocol-level reasoning trace.',
    sample:
      'I need to choose between two strategies for a project. One strategy can grow faster but requires more money, more management attention, and creates a higher chance of a painful mistake. The other strategy is slower, but it is easier to control and safer for the team. We have tried cautious growth and it worked, but not fast enough. I want a recommendation, and I also want to see how the conclusion was reached, which assumptions mattered most, and what would change the decision.',
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

  function selectDemo(selectedDemo: BorisDemo) {
    setDemo(selectedDemo);
    setMessage(demoDescriptions[selectedDemo].sample);
    setAnswer('');
    setError('');
    setRuntimeText('');
  }

  return (
    <main>
      <section className="card">
        <p className="meta">BORIS Public Dashboard · MVP-1</p>
        <h1>BOIS / SIMA / BORIS</h1>
        <p>
          Ask a question and see how BORIS applies the public BOIS/SIMA/BORIS core.
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
              onClick={() => selectDemo(option)}
            >
              <span className="demoNumber">{index + 1}</span>
              <strong>{demoDescriptions[option].title}</strong>
              <span>{demoDescriptions[option].subtitle}</span>
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
