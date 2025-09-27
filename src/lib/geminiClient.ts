export async function geminiGenerate(prompt: string): Promise<string> {
  const url = process.env.GEMINI_API_URL || 'https://generative.googleapis.com/v1/models/text-bison-001:generate'
  const key = process.env.GEMINI_API_KEY
  if (!key) {
    console.error('GEMINI_API_KEY missing')
    return 'No insights available (Gemini key missing).'
  }
  try {
    const body = {
      prompt: {
        text: prompt
      },
      temperature: 0.2,
      maxOutputTokens: 400
    }
    const resp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${key}`
      },
      body: JSON.stringify(body)
    })
    if (!resp.ok) {
      const txt = await resp.text()
      console.error('Gemini error', resp.status, txt)
      return 'Insights unavailable (Gemini API error).'
    }
    const data = await resp.json()
    const text = data?.candidates?.[0]?.content || data?.output?.[0]?.content || data?.choices?.[0]?.text || JSON.stringify(data)
    return String(text)
  } catch (err) {
    console.error('Gemini request failed', err)
    return 'Insights unavailable (request failed).'
  }
}
