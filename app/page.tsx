'use client';

import { useState } from 'react';
import { BorisDemo, BorisDepth, Locale, translations } from '../lib/i18n';

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

const depthCosts: Record<BorisDepth, number> = {
  FAST: 1,
  NORMAL: 2,
  DEEP: 4,
};

const DAILY_CREDIT_LIMIT = 20;

function creditWord(locale: Locale, amount: number): string {
  const t = translations[locale];
  return amount === 1 ? t.credit : t.credits;
}

function formatCreditText(locale: Locale, creditLimit?: CreditLimit): string {
  const t = translations[locale];

  if (!creditLimit) {
    return `${DAILY_CREDIT_LIMIT} ${t.creditsPerDay}`;
  }

  return `${creditLimit.remaining}/${creditLimit.limit} ${t.remainingToday}`;
}

export default function HomePage() {
  const [locale, setLocale] = useState<Locale>('en');
  const [message, setMessage] = useState('');
  const [depth, setDepth] = useState<BorisDepth>('NORMAL');
  const [demo, setDemo] = useState<BorisDemo>('UNKNOWN_REGISTER');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creditLimit, setCreditLimit] = useState<CreditLimit | undefined>();
  const [runtimeText, setRuntimeText] = useState('');

  const t = translations[locale];
  const demoDescriptions = t.demos;
  const depthDescriptions = t.depthDescriptions;

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
        const responseDemo = data.demo || demo;
        setRuntimeText(
          `${t.runtimeCore}: ${data.runtime.runtimeCoreChars}/${data.runtime.fullCoreChars} ${t.characters} · ${data.depth || depth} ${t.mode} · ${demoDescriptions[responseDemo].title}`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setAnswer(data.answer || t.noAnswer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function selectDemo(selectedDemo: BorisDemo) {
    setDemo(selectedDemo);
    setMessage(translations[locale].demos[selectedDemo].sample);
    setAnswer('');
    setError('');
    setRuntimeText('');
  }

  function switchLocale(nextLocale: Locale) {
    const currentSample = translations[locale].demos[demo].sample;
    const shouldReplacePrompt = message.trim().length === 0 || message === currentSample;

    setLocale(nextLocale);

    if (shouldReplacePrompt) {
      setMessage(translations[nextLocale].demos[demo].sample);
    }

    setAnswer('');
    setError('');
    setRuntimeText('');
  }

  return (
    <main>
      <section className="card">
        <div className="topBar">
          <p className="meta">{t.meta}</p>
          <div className="languageSwitch" aria-label="Language switcher">
            {(['en', 'ru'] as Locale[]).map((option) => (
              <button
                key={option}
                type="button"
                className={locale === option ? 'languageButton active' : 'languageButton'}
                onClick={() => switchLocale(option)}
              >
                {option.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <h1>{t.title}</h1>
        <p>
          {t.intro} {t.noStorage}
        </p>

        <div className="demoIntro">
          <span>{t.demoIntroLabel}</span>
          <strong>{t.demoIntroFlow}</strong>
        </div>

        <div className="demoSelector" aria-label={t.demoAriaLabel}>
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
            <span className="creditLabel">{t.creditLabels.demoFocus}</span>
            <strong>{demoDescriptions[demo].title}</strong>
          </div>
          <div>
            <span className="creditLabel">{t.creditLabels.selectedMode}</span>
            <strong>{depth}</strong>
          </div>
          <div>
            <span className="creditLabel">{t.creditLabels.cost}</span>
            <strong>
              {depthCosts[depth]} {creditWord(locale, depthCosts[depth])}
            </strong>
          </div>
          <div>
            <span className="creditLabel">{t.creditLabels.budget}</span>
            <strong>{formatCreditText(locale, creditLimit)}</strong>
          </div>
        </div>

        <div className="depthSelector" aria-label={t.depthAriaLabel}>
          {(['FAST', 'NORMAL', 'DEEP'] as BorisDepth[]).map((option) => (
            <button
              key={option}
              type="button"
              className={depth === option ? 'depthButton active' : 'depthButton'}
              onClick={() => setDepth(option)}
            >
              <span className="depthButtonHeader">
                <strong>{option}</strong>
                <em>
                  {depthCosts[option]} {creditWord(locale, depthCosts[option])}
                </em>
              </span>
              <span>{depthDescriptions[option]}</span>
            </button>
          ))}
        </div>

        <textarea
          value={message}
          maxLength={10000}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t.textareaPlaceholder}
        />

        <p className="meta">
          {message.length}/10000 {t.characters} · {formatCreditText(locale, creditLimit)}
          {runtimeText ? ` · ${runtimeText}` : ''}
        </p>

        <button className="primaryButton" onClick={submit} disabled={loading || message.trim().length === 0}>
          {loading
            ? t.thinking
            : `${t.run} ${demoDescriptions[demo].title} · ${depth} · ${depthCosts[depth]} ${creditWord(locale, depthCosts[depth])}`}
        </button>

        {error && <div className="output">{t.error}: {error}</div>}
        {answer && <div className="output">{answer}</div>}
      </section>
    </main>
  );
}
