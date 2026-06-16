import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import {
  BorisDepth,
  getBorisCore,
  getDepthInstructions,
  getRuntimeCore,
  normalizeBorisDepth,
} from '../../../lib/core';

const MAX_INPUT_CHARS = 10000;
const RATE_LIMIT_PER_DAY = Number(process.env.BORIS_RATE_LIMIT_PER_DAY || 10);
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000;

const MAX_OUTPUT_TOKENS: Record<BorisDepth, number> = {
  FAST: 450,
  NORMAL: 700,
  DEEP: 1100,
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const rateLimitStore = new Map<string, RateLimitBucket>();

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }

  return request.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(ip: string) {
  const now = Date.now();
  const existing = rateLimitStore.get(ip);

  if (!existing || existing.resetAt <= now) {
    const bucket = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimitStore.set(ip, bucket);
    return {
      allowed: true,
      remaining: Math.max(RATE_LIMIT_PER_DAY - 1, 0),
      resetAt: bucket.resetAt,
    };
  }

  if (existing.count >= RATE_LIMIT_PER_DAY) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: existing.resetAt,
    };
  }

  existing.count += 1;
  rateLimitStore.set(ip, existing);

  return {
    allowed: true,
    remaining: Math.max(RATE_LIMIT_PER_DAY - existing.count, 0),
    resetAt: existing.resetAt,
  };
}

export async function POST(request: NextRequest) {
  try {
    const rateLimit = checkRateLimit(getClientIp(request));

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          error: `Daily request limit reached. Try again after ${new Date(rateLimit.resetAt).toISOString()}.`,
          rateLimit,
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    const message = typeof body.message === 'string' ? body.message.trim() : '';
    const depth = normalizeBorisDepth(body.depth);

    if (!message) {
      return NextResponse.json({ error: 'Message is required.', rateLimit }, { status: 400 });
    }

    if (message.length > MAX_INPUT_CHARS) {
      return NextResponse.json(
        { error: `Message is too long. Maximum is ${MAX_INPUT_CHARS} characters.`, rateLimit },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured.', rateLimit },
        { status: 500 }
      );
    }

    const fullCore = await getBorisCore();
    const runtimeCore = getRuntimeCore(fullCore, depth);
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      max_tokens: MAX_OUTPUT_TOKENS[depth],
      messages: [
        {
          role: 'system',
          content: `You are BORIS Public Dashboard MVP. Use the following public BOIS/BORIS runtime core as operating context. Do not claim to store user archives or retain private files.\n\n${getDepthInstructions(depth)}\n\nBORIS RUNTIME CORE:\n${runtimeCore}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const answer = completion.choices[0]?.message?.content || 'No answer returned.';

    return NextResponse.json({
      answer,
      depth,
      rateLimit,
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
