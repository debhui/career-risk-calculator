import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { resumeText } = await req.json();
    if (!resumeText || resumeText.trim().length === 0) {
      return NextResponse.json({ error: 'Missing resume text' }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

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

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Gemini sometimes wraps JSON in code fences — clean them
    const cleaned = text.replace(/```json|```/g, '').trim();

    return NextResponse.json(JSON.parse(cleaned));
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to parse resume' }, { status: 500 });
  }
}
