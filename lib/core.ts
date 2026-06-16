export type BorisDepth = 'FAST' | 'NORMAL' | 'DEEP';
export type BorisDemo = 'UNKNOWN_REGISTER' | 'SIMA_ANALYSIS' | 'DECISION_TRACE';

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

const DEMO_INSTRUCTIONS: Record<BorisDemo, string> = {
  UNKNOWN_REGISTER: [
    'Demo focus: Unknown Register.',
    'Make the main value of the answer visible by separating known facts, assumptions, unknowns, critical unknowns, and the next evidence-gathering step.',
    'Prefer this structure: Short answer; Known / assumed / unknown; Critical unknowns ranked by risk; Minimum next test.',
    'Do not pretend certainty when the user has not supplied enough evidence.',
  ].join('\n'),
  SIMA_ANALYSIS: [
    'Demo focus: SIMA Analysis.',
    'Make the main value of the answer visible by decomposing the goal/system, locating dependencies, risks, contradictions, and the most likely failure point.',
    'Prefer this structure: Goal; System map; Dependencies; Failure point; Stabilizing action.',
    'Keep the decomposition practical and avoid decorative complexity.',
  ].join('\n'),
  DECISION_TRACE: [
    'Demo focus: Why BORIS answered this way.',
    'Make the main value of the answer visible by showing a safe decision trace: protocol names, inputs considered, checks performed, and why the final answer follows.',
    'Do not reveal hidden chain-of-thought. Show an audit-style trace instead: Domain detection; Unknown register; SIMA check; Response synthesis; Confidence/limits.',
    'Include active physiology markers when relevant.',
  ].join('\n'),
};

export const DEPTH_CREDIT_COSTS: Record<BorisDepth, number> = {
  FAST: 1,
  NORMAL: 2,
  DEEP: 4,
};

export function normalizeBorisDepth(value: unknown): BorisDepth {
  if (value === 'FAST' || value === 'NORMAL' || value === 'DEEP') {
    return value;
  }

  return 'NORMAL';
}

export function normalizeBorisDemo(value: unknown): BorisDemo {
  if (value === 'UNKNOWN_REGISTER' || value === 'SIMA_ANALYSIS' || value === 'DECISION_TRACE') {
    return value;
  }

  return 'UNKNOWN_REGISTER';
}

export function getDepthInstructions(depth: BorisDepth): string {
  return DEPTH_INSTRUCTIONS[depth];
}

export function getDemoInstructions(demo: BorisDemo): string {
  return DEMO_INSTRUCTIONS[demo];
}

export function getDepthCreditCost(depth: BorisDepth): number {
  return DEPTH_CREDIT_COSTS[depth];
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
