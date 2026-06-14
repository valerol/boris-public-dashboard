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
