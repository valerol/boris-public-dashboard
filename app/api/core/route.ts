import { NextResponse } from 'next/server';
import { getBorisCore } from '../../../lib/core';

export async function GET() {
  try {
    const core = await getBorisCore();
    return NextResponse.json({ core });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
