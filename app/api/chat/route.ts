import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import {
  BORIS_COMPARISON_INSTRUCTIONS,
  getBorisCore,
  getRuntimeCore,
} from '../../../lib/core';

const MAX_INPUT_CHARS = 10000;
const DAILY_CREDIT_LIMIT = Number(process.env.BORIS_DAILY_CREDIT_LIMIT || 20);
const COMPARISON_CREDIT_COST = Number(process.env.BORIS_COMPARISON_CREDIT_COST || 4);
const CREDIT_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_OUTPUT_TOKENS = 850;

type CreditLimitBucket = {
  usedCredits: number;
  resetAt: number;
};

type CreditLimitResult = {
  allowed: boolean;
  limit: number;
  used: number;
  remaining: number;
  cost: number;
  resetAt: number;
};

const creditLimitStore = new Map<string, CreditLimitBucket>();

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip') || 'unknown';
}

function spendCredits(ip: string, cost: number): CreditLimitResult {
  const now = Date.now();
  const existing = creditLimitStore.get(ip);

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + CREDIT_LIMIT_WINDOW_MS;

    if (cost > DAILY_CREDIT_LIMIT) {
      return {
        allowed: false,
        limit: DAILY_CREDIT_LIMIT,
        used: 0,
        remaining: DAILY_CREDIT_LIMIT,
        cost,
        resetAt,
      };
    }

    const bucket = { usedCredits: cost, resetAt };
    creditLimitStore.set(ip, bucket);

    return {
      allowed: true,
      limit: DAILY_CREDIT_LIMIT,
      used: bucket.usedCredits,
      remaining: Math.max(DAILY_CREDIT_LIMIT - bucket.usedCredits, 0),
      cost,
      resetAt,
    };
  }

  if (existing.usedCredits + cost > DAILY_CREDIT_LIMIT) {
    return {
      allowed: false,
      limit: DAILY_CREDIT_LIMIT,
      used: existing.usedCredits,
      remaining: Math.max(DAILY_CREDIT_LIMIT - existing.usedCredits, 0),
      cost,
      resetAt: existing.resetAt,
    };
  }

  existing.usedCredits += cost;
  creditLimitStore.set(ip, existing);

  return {
    allowed: true,
    limit: DAILY_CREDIT_LIMIT,
    used: existing.usedCredits,
    remaining: Math.max(DAILY_CREDIT_LIMIT - existing.usedCredits, 0),
    cost,
    resetAt: existing.resetAt,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';

    if (!message) {
      return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
    }

    if (message.length > MAX_INPUT_CHARS) {
      return NextResponse.json(
        { error: `Message is too long. Maximum is ${MAX_INPUT_CHARS} characters.` },
        { status: 400 }
      );
    }

    const creditLimit = spendCredits(getClientIp(request), COMPARISON_CREDIT_COST);

    if (!creditLimit.allowed) {
      return NextResponse.json(
        {
          error: `Daily credit limit reached. LLM vs BORIS comparison costs ${COMPARISON_CREDIT_COST} credits, but only ${creditLimit.remaining} credits remain. Try again after ${new Date(creditLimit.resetAt).toISOString()}.`,
          creditLimit,
        },
        { status: 429 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured.', creditLimit },
        { status: 500 }
      );
    }

    const fullCore = await getBorisCore();
    const runtimeCore = getRuntimeCore(fullCore);
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const [llmCompletion, borisCompletion] = await Promise.all([
      client.chat.completions.create({
        model,
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: [
          {
            role: 'system',
            content: [
              'You are a helpful general-purpose AI assistant.',
              'Answer the user directly and practically.',
              'Use the facts and numbers supplied by the user.',
              'Give concrete recommendations, but do not use BORIS, BOIS, SIMA, Unknown Register, or any BORIS-specific framework.',
            ].join('\n'),
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
      client.chat.completions.create({
        model,
        max_tokens: MAX_OUTPUT_TOKENS,
        messages: [
          {
            role: 'system',
            content: `You are BORIS Public Dashboard MVP. Use the following public BOIS/SIMA/BORIS runtime core as operating context. Do not claim to store user archives or retain private files.\n\n${BORIS_COMPARISON_INSTRUCTIONS}\n\nBORIS RUNTIME CORE:\n${runtimeCore}`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
      }),
    ]);

    const llmAnswer = llmCompletion.choices[0]?.message?.content || 'No answer returned.';
    const borisAnswer = borisCompletion.choices[0]?.message?.content || 'No answer returned.';

    return NextResponse.json({
      llmAnswer,
      borisAnswer,
      creditLimit,
      runtime: {
        fullCoreChars: fullCore.length,
        runtimeCoreChars: runtimeCore.length,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
