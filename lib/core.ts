export const BORIS_RUNTIME_CORE_CHAR_LIMIT = 10000;

export const BORIS_COMPARISON_INSTRUCTIONS = [
  'Demo focus: LLM vs BORIS.',
  'Show the practical difference between a regular LLM answer and a BORIS-style philosophical machine answer.',
  'Do not merely complain about missing data. Use the supplied facts to generate plausible hypotheses, rank them, and propose concrete tests.',
  'Use approximate calculations when possible and clearly label them as approximations.',
  'Prefer this structure:',
  '1. Short diagnosis.',
  '2. What is known from the numbers.',
  '3. Critical unknowns and why they matter.',
  '4. Most likely bottlenecks / hypotheses, ranked.',
  '5. A concrete 30-day test plan with success criteria.',
  '6. What result would change the recommendation.',
  'Keep the answer grounded, specific, and operational.',
].join('\n');

export function getRuntimeCore(fullCore: string): string {
  if (fullCore.length <= BORIS_RUNTIME_CORE_CHAR_LIMIT) {
    return fullCore;
  }

  return [
    fullCore.slice(0, BORIS_RUNTIME_CORE_CHAR_LIMIT),
    `\n\n[Runtime Core truncated for LLM vs BORIS demo: ${BORIS_RUNTIME_CORE_CHAR_LIMIT} of ${fullCore.length} characters included.]`,
  ].join('');
}

export async function getBorisCore(): Promise<string> {
  const coreUrl = process.env.BORIS_CORE_URL;

  if (!coreUrl) {
    return JSON.stringify({
      system: 'BOIS/SIMA/BORIS',
      version: 'local-fallback',
      rules: [
        'Do not store user archives on the server.',
        'Use BOIS/SIMA/BORIS as the operating method for analysis and answers.',
        'Separate known facts, assumptions, unknowns, hypotheses, tests, and limitations.',
      ],
    });
  }

  const response = await fetch(coreUrl, {
    // Cache the public core for 1 hour on Vercel/Next.js runtime.
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Failed to load BORIS core: ${response.status}`);
  }

  return await response.text();
}
