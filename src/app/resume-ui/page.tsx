// src/lib/geminiClient.ts
const GEMINI_KEY = process.env.GEMINI_API_KEY1;
const GEMINI_URL =
  process.env.GEMINI_API_URL ||
  'https://generative.googleapis.com/v1/models/text-bison-001:generate';

export const geminiGenerate = async (text: string) => {
  if (!GEMINI_KEY) {
    console.error('GEMINI_API_KEY missing');
    return 'No insights available (Gemini key missing).';
  }

  // fetch is available globally in server-side code
  const response = await fetch(GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GEMINI_KEY}`,
    },
    body: JSON.stringify({ prompt: text }),
  });

  const data = await response.json();
  return data?.output?.[0]?.content || 'No output from Gemini';
};
