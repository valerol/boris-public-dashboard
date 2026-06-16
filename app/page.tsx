'use client';

import { useState } from 'react';
import { COMPARISON_CREDIT_COST, DAILY_CREDIT_LIMIT, Locale, translations } from '../lib/i18n';

type CreditLimit = {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
  cost: number;
  resetAt: number;
};

type ChatResponse = {
  llmAnswer?: string;
  borisAnswer?: string;
  error?: string;
  creditLimit?: CreditLimit;
  runtime?: {
    fullCoreChars: number;
    runtimeCoreChars: number;
  };
};

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
  const [message, setMessage] = useState(translations.en.demoPrompt);
  const [llmAnswer, setLlmAnswer] = useState('');
  const [borisAnswer, setBorisAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [creditLimit, setCreditLimit] = useState<CreditLimit | undefined>();
  const [runtimeText, setRuntimeText] = useState('');

  const t = translations[locale];

  async function submit() {
    setLoading(true);
    setError('');
    setLlmAnswer('');
    setBorisAnswer('');
    setRuntimeText('');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      const data = (await response.json()) as ChatResponse;

      if (data.creditLimit) {
        setCreditLimit(data.creditLimit);
      }

      if (data.runtime) {
        setRuntimeText(
          `${t.runtimeCore}: ${data.runtime.runtimeCoreChars}/${data.runtime.fullCoreChars} ${t.characters}`
        );
      }

      if (!response.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setLlmAnswer(data.llmAnswer || t.noAnswer);
      setBorisAnswer(data.borisAnswer || t.noAnswer);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  function switchLocale(nextLocale: Locale) {
    const currentSample = translations[locale].demoPrompt;
    const shouldReplacePrompt = message.trim().length === 0 || message === currentSample;

    setLocale(nextLocale);

    if (shouldReplacePrompt) {
      setMessage(translations[nextLocale].demoPrompt);
    }

    setLlmAnswer('');
    setBorisAnswer('');
    setError('');
    setRuntimeText('');
  }

  return (
    <main>
      <section className="card">
        <div className="topBar">
          <p className="meta">{t.meta}</p>
          <div className="languageSwitch" aria-label={t.languageAriaLabel}>
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

        <div className="compareModeCard">
          <span>{t.compareLabel}</span>
          <strong>{t.compareTitle}</strong>
          <p>{t.compareSubtitle}</p>
        </div>

        <textarea
          value={message}
          maxLength={10000}
          onChange={(event) => setMessage(event.target.value)}
          placeholder={t.textareaPlaceholder}
        />

        <div className="compactStatus" aria-live="polite">
          <span>
            {message.length}/10000 {t.characters}
          </span>
          <span>
            {t.comparisonCost}: {COMPARISON_CREDIT_COST} {creditWord(locale, COMPARISON_CREDIT_COST)}
          </span>
          <span>
            {t.budget}: {formatCreditText(locale, creditLimit)}
          </span>
          {runtimeText && <span>{runtimeText}</span>}
        </div>

        <button className="primaryButton" onClick={submit} disabled={loading || message.trim().length === 0}>
          {loading ? t.thinking : t.run}
        </button>

        {error && <div className="output">{t.error}: {error}</div>}

        {(llmAnswer || borisAnswer) && (
          <div className="comparisonGrid">
            <article className="answerPanel">
              <div className="answerHeader">
                <h2>{t.llmTitle}</h2>
                <p>{t.llmSubtitle}</p>
              </div>
              <div className="output answerOutput">{llmAnswer}</div>
            </article>

            <article className="answerPanel borisPanel">
              <div className="answerHeader">
                <h2>{t.borisTitle}</h2>
                <p>{t.borisSubtitle}</p>
              </div>
              <div className="output answerOutput">{borisAnswer}</div>
            </article>
          </div>
        )}
      </section>
    </main>
  );
}
