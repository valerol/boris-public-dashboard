export type Locale = 'en' | 'ru';

type Translation = {
  meta: string;
  title: string;
  intro: string;
  noStorage: string;
  languageAriaLabel: string;
  compareLabel: string;
  compareTitle: string;
  compareSubtitle: string;
  textareaPlaceholder: string;
  demoPrompt: string;
  thinking: string;
  run: string;
  llmTitle: string;
  llmSubtitle: string;
  borisTitle: string;
  borisSubtitle: string;
  credits: string;
  credit: string;
  remainingToday: string;
  creditsPerDay: string;
  characters: string;
  runtimeCore: string;
  comparisonCost: string;
  budget: string;
  error: string;
  noAnswer: string;
};

export const COMPARISON_CREDIT_COST = 4;
export const DAILY_CREDIT_LIMIT = 20;

export const translations: Record<Locale, Translation> = {
  en: {
    meta: 'BORIS Public Dashboard · MVP-1',
    title: 'BOIS / SIMA / BORIS',
    intro: 'Ask a question and compare a regular LLM answer with BORIS using the public BOIS/SIMA/BORIS core.',
    noStorage: 'This MVP does not store user archives or conversation content.',
    languageAriaLabel: 'Language switcher',
    compareLabel: 'Demo mode',
    compareTitle: 'LLM vs BORIS',
    compareSubtitle: 'One question, two answers: a regular LLM response and a BORIS response with unknowns, system constraints, hypotheses, and next tests.',
    textareaPlaceholder: 'Describe a real decision, bottleneck, or problem...',
    demoPrompt:
      'I run a small online business that sells one main product category. For the last 6 months revenue has stayed around $8,000 per month. The website gets about 12,000 visits per month, conversion is 1.1%, average order value is $62, and roughly 18% of customers buy again within 60 days. I have $3,000 and 30 days for the next experiment. I already tried a 10% discount for one week and posted regularly on social media, but sales changed by less than 5%. I need to decide whether to improve the website, spend money on ads, expand the product range, or work on repeat purchases. Please give me practical hypotheses and a concrete 30-day plan.',
    thinking: 'Comparing...',
    run: 'Compare LLM vs BORIS',
    llmTitle: 'Regular LLM',
    llmSubtitle: 'General-purpose answer from the same model without BORIS runtime protocols.',
    borisTitle: 'BORIS',
    borisSubtitle: 'BOIS/SIMA/BORIS runtime answer: unknowns, constraints, hypotheses, tests.',
    credits: 'credits',
    credit: 'credit',
    remainingToday: 'credits remaining today',
    creditsPerDay: 'credits/IP/day',
    characters: 'characters',
    runtimeCore: 'Runtime core',
    comparisonCost: 'Comparison cost',
    budget: 'Budget',
    error: 'Error',
    noAnswer: 'No answer returned.',
  },
  ru: {
    meta: 'BORIS Public Dashboard · MVP-1',
    title: 'BOIS / SIMA / BORIS',
    intro: 'Задайте вопрос и сравните обычный ответ LLM с ответом BORIS на публичном ядре BOIS/SIMA/BORIS.',
    noStorage: 'Этот MVP не хранит пользовательские архивы и содержимое диалогов.',
    languageAriaLabel: 'Переключатель языка',
    compareLabel: 'Режим демонстрации',
    compareTitle: 'LLM vs BORIS',
    compareSubtitle: 'Один вопрос, два ответа: обычная LLM и BORIS с неизвестностями, ограничениями системы, гипотезами и следующими тестами.',
    textareaPlaceholder: 'Опишите реальное решение, ограничение или проблему...',
    demoPrompt:
      'У меня небольшой онлайн-бизнес, который продаёт одну основную категорию товаров. Последние 6 месяцев выручка держится около 800 000 ₽ в месяц. На сайт приходит примерно 12 000 посетителей в месяц, конверсия 1,1%, средний чек 6 200 ₽, около 18% покупателей возвращаются в течение 60 дней. На следующий эксперимент у меня есть 300 000 ₽ и 30 дней. Я уже пробовала скидку 10% на одну неделю и регулярно публиковала посты в соцсетях, но продажи изменились меньше чем на 5%. Мне нужно решить, что делать дальше: улучшать сайт, вкладываться в рекламу, расширять ассортимент или работать над повторными покупками. Дай практические гипотезы и конкретный план на 30 дней.',
    thinking: 'Сравниваю...',
    run: 'Сравнить LLM vs BORIS',
    llmTitle: 'Обычная LLM',
    llmSubtitle: 'Ответ той же модели без runtime-протоколов BORIS.',
    borisTitle: 'BORIS',
    borisSubtitle: 'Ответ BOIS/SIMA/BORIS runtime: неизвестности, ограничения, гипотезы, тесты.',
    credits: 'кредитов',
    credit: 'кредит',
    remainingToday: 'кредитов осталось сегодня',
    creditsPerDay: 'кредитов/IP/день',
    characters: 'символов',
    runtimeCore: 'Runtime core',
    comparisonCost: 'Стоимость сравнения',
    budget: 'Бюджет',
    error: 'Ошибка',
    noAnswer: 'Ответ не получен.',
  },
};
