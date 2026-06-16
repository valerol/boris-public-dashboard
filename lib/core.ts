export type BorisDepth = 'FAST' | 'NORMAL' | 'DEEP';

const RUNTIME_CORE_CHAR_LIMITS: Record<BorisDepth, number> = {
  FAST: 4000,
  NORMAL: 8000,
  DEEP: 16000,
};

const DEPTH_INSTRUCTIONS: Record<BorisDepth, string> = {
  FAST: [
    'Depth mode: FAST.',
    'Prioritize a short answer and the most critical unknowns.',
    'Do not produce a long decomposition unless the user explicitly asks for it.',
  ].join('\n'),
  NORMAL: [
    'Depth mode: NORMAL.',
    'Use BORIS protocols with moderate detail.',
    'Include key unknowns and a compact SIMA-style risk/decomposition check when useful.',
  ].join('\n'),
  DEEP: [
    'Depth mode: DEEP.',
    'Use the richest available BORIS analysis within the response budget.',
    'Include unknowns, SIMA-style decomposition, decision trace, and active physiology markers when useful.',
  ].join('\n'),
};

export function normalizeBorisDepth(value: unknown): BorisDepth {
  if (value === 'FAST' || value === 'NORMAL' || value === 'DEEP') {
    return value;
  }

  return 'NORMAL';
}

export function getDepthInstructions(depth: BorisDepth): string {
  return DEPTH_INSTRUCTIONS[depth];
}

export function getRuntimeCore(fullCore: string, depth: BorisDepth): string {
  const limit = RUNTIME_CORE_CHAR_LIMITS[depth];

  if (fullCore.length <= limit) {
    return fullCore;
  }

  return [
    fullCore.slice(0, limit),
    `\n\n[Runtime Core truncated for ${depth} mode: ${limit} of ${fullCore.length} characters included.]`,
  ].join('');
}

export async function getBorisCore(): Promise<string> {
  const coreUrl = process.env.BORIS_CORE_URL;

  if (!coreUrl) {
    return JSON.stringify({
      system: 'BOIS/BORIS',
      version: 'local-fallback',
      rules: [
        'Do not store user archives on the server.',
        'Use BOIS/BORIS as the operating method for analysis and answers.',
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
