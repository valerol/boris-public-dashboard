import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import { getBorisCore } from '../../../lib/core';

const MAX_INPUT_CHARS = 10000;
const MAX_OUTPUT_TOKENS = 700; // roughly up to ~2,000 characters depending on language

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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: 'OPENAI_API_KEY is not configured.' },
        { status: 500 }
      );
    }

    const core = await getBorisCore();
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      max_tokens: MAX_OUTPUT_TOKENS,
      messages: [
        {
          role: 'system',
          content: `You are BORIS Public Dashboard MVP. Use the following public BOIS/BORIS core as operating context. Do not claim to store user archives or retain private files.\n\nBORIS CORE:\n${core}`,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    const answer = completion.choices[0]?.message?.content || 'No answer returned.';

    return NextResponse.json({ answer });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
