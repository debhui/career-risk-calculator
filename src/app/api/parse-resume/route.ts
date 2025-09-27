import { NextRequest, NextResponse } from 'next/server';
import { geminiGenerate } from '../../lib/gemini';


// Initialize Google GenAI client
const client = new GoogleGenAI({
  apiKey: process.env.GOOGLE_API_KEY, // Make sure this is set in .env.local
});

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();

    if (!resumeText) {
      return NextResponse.json(
        { error: 'resumeText is required' },
        { status: 400 }
      );
    }
    const prompt = `
You are a professional resume parser.
Extract the following fields and return ONLY valid JSON matching this schema:

{
  "personal_info": { "full_name": "", "email": "", "phone_numbers": [] },
  "summary": { "headline": "", "career_objective": "" },
  "work_experience": [ { "company_name": "", "job_title": "", "start_date": "", "end_date": "", "skills_used": [] } ],
  "skills": { "primary": [], "secondary": [], "ai_ml": [] },
  "education": [ { "degree": "", "major": "", "institution": "", "graduation_year": "" } ],
  "certifications": [ { "name": "", "issuer": "" } ],
  "projects": [],
  "derived_metrics": { "total_experience_years": 0 }
}

Resume Text:
${resumeText}
`;
    const response = await geminiGenerate(prompt)
    // Gemini response
    const parsedText = response.text;

    // Try parsing JSON from the AI output
    let parsedJSON;
    try {
      parsedJSON = JSON.parse(parsedText);
    } catch {
      parsedJSON = { rawOutput: parsedText };
    }

    return NextResponse.json(parsedJSON);
  } catch (err) {
    console.error('Error parsing resume:', err);
    return NextResponse.json(
      { error: 'Failed to parse resume' },
      { status: 500 }
    );
  }
}
