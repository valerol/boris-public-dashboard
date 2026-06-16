export type Locale = 'en' | 'ru';
export type BorisDepth = 'FAST' | 'NORMAL' | 'DEEP';
export type BorisDemo = 'UNKNOWN_REGISTER' | 'SIMA_ANALYSIS' | 'DECISION_TRACE';

type DemoText = {
  title: string;
  subtitle: string;
  sample: string;
};

type Translation = {
  meta: string;
  title: string;
  intro: string;
  noStorage: string;
  demoIntroLabel: string;
  demoIntroFlow: string;
  demoAriaLabel: string;
  creditLabels: {
    demoFocus: string;
    selectedMode: string;
    cost: string;
    budget: string;
  };
  depthAriaLabel: string;
  depthDescriptions: Record<BorisDepth, string>;
  demos: Record<BorisDemo, DemoText>;
  textareaPlaceholder: string;
  thinking: string;
  run: string;
  credits: string;
  credit: string;
  remainingToday: string;
  creditsPerDay: string;
  characters: string;
  runtimeCore: string;
  mode: string;
  error: string;
  noAnswer: string;
};

export const translations: Record<Locale, Translation> = {
  en: {
    meta: 'BORIS Public Dashboard · MVP-1',
    title: 'BOIS / SIMA / BORIS',
    intro: 'Ask a question and see how BORIS applies the public BOIS/SIMA/BORIS core.',
    noStorage: 'This MVP does not store user archives or conversation content.',
    demoIntroLabel: '2–3 minute BORIS demo',
    demoIntroFlow: 'Unknown Register → SIMA Analysis → Decision Trace',
    demoAriaLabel: 'BORIS demonstration focus',
    creditLabels: {
      demoFocus: 'Demo focus',
      selectedMode: 'Selected mode',
      cost: 'Cost',
      budget: 'Budget',
    },
    depthAriaLabel: 'BORIS depth mode',
    depthDescriptions: {
      FAST: 'Short answer, critical unknowns, lowest token use.',
      NORMAL: 'Balanced BORIS answer with unknowns and compact SIMA checks.',
      DEEP: 'Richer analysis with unknowns, SIMA, trace, and physiology markers.',
    },
    demos: {
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
    },
    textareaPlaceholder: 'Ask BORIS a question...',
    thinking: 'Thinking...',
    run: 'Run',
    credits: 'credits',
    credit: 'credit',
    remainingToday: 'credits remaining today',
    creditsPerDay: 'credits/IP/day',
    characters: 'characters',
    runtimeCore: 'Runtime core',
    mode: 'mode',
    error: 'Error',
    noAnswer: 'No answer returned.',
  },
  ru: {
    meta: 'BORIS Public Dashboard · MVP-1',
    title: 'BOIS / SIMA / BORIS',
    intro: 'Задайте вопрос и посмотрите, как BORIS применяет публичное ядро BOIS/SIMA/BORIS.',
    noStorage: 'Этот MVP не хранит пользовательские архивы и содержимое диалогов.',
    demoIntroLabel: 'Демонстрация BORIS за 2–3 минуты',
    demoIntroFlow: 'Unknown Register → SIMA Analysis → Decision Trace',
    demoAriaLabel: 'Фокус демонстрации BORIS',
    creditLabels: {
      demoFocus: 'Фокус демо',
      selectedMode: 'Режим',
      cost: 'Стоимость',
      budget: 'Бюджет',
    },
    depthAriaLabel: 'Глубина анализа BORIS',
    depthDescriptions: {
      FAST: 'Короткий ответ, критические неизвестности, минимальный расход токенов.',
      NORMAL: 'Сбалансированный ответ BORIS с неизвестностями и компактной SIMA-проверкой.',
      DEEP: 'Более глубокий анализ с неизвестностями, SIMA, трассировкой и маркерами физиологии.',
    },
    demos: {
      UNKNOWN_REGISTER: {
        title: 'Unknown Register',
        subtitle: 'Находит критические неизвестности, ранжирует риск и предлагает проверяемые гипотезы вместо имитации уверенности.',
        sample:
          'У меня есть небольшой онлайн-проект, и я хочу выбрать следующий шаг роста. Продажи стабильные, но последние несколько месяцев почти не растут. Я знаю, что часть клиентов возвращается, трафик на сайт есть, а бюджета хватает только на одно серьёзное действие. Я уже пробовала небольшие скидки и несколько публикаций в соцсетях, но результат был слабым. Помоги понять, какие неизвестности сейчас самые важные, какие гипотезы могут объяснять остановку роста и какую информацию нужно собрать перед решением.',
      },
      SIMA_ANALYSIS: {
        title: 'SIMA Analysis',
        subtitle: 'Раскладывает систему на части, проверяет зависимости и ищет наиболее вероятное ограничение.',
        sample:
          'Я управляю сервисным проектом, который должен стать прибыльнее, но система как будто застряла. Входящих запросов достаточно, несколько человек работают над выполнением, клиенты в целом довольны, но итоговая прибыль почти не меняется. Мы уже пробовали работать быстрее и брать больше заявок, но это только добавило проблем с координацией. Мне нужно увидеть систему по частям, найти наиболее вероятное ограничение и понять, что менять первым.',
      },
      DECISION_TRACE: {
        title: 'Why BORIS answered this way',
        subtitle: 'Показывает путь решения, допущения, проверки доказательств и трассировку протоколов.',
        sample:
          'Мне нужно выбрать между двумя стратегиями для проекта. Первая может дать быстрый рост, но требует больше денег, больше управленческого внимания и создаёт высокий риск болезненной ошибки. Вторая растёт медленнее, зато её проще контролировать и она безопаснее для команды. Осторожный рост мы уже пробовали, он работает, но недостаточно быстро. Мне нужна рекомендация, но я также хочу увидеть, как был получен вывод, какие допущения оказались самыми важными и что могло бы изменить решение.',
      },
    },
    textareaPlaceholder: 'Задайте вопрос BORIS...',
    thinking: 'Думаю...',
    run: 'Запустить',
    credits: 'кредитов',
    credit: 'кредит',
    remainingToday: 'кредитов осталось сегодня',
    creditsPerDay: 'кредитов/IP/день',
    characters: 'символов',
    runtimeCore: 'Runtime core',
    mode: 'режим',
    error: 'Ошибка',
    noAnswer: 'Ответ не получен.',
  },
};
