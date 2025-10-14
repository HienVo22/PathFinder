import { NextResponse } from 'next/server';

// Server-side AI call using Google Gemini (free)
export async function POST(request) {
  try {
    const body = await request.json();
    const text = body.text || '';
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'text required' }, { status: 400 });
    }

    const geminiKey = process.env.GEMINI_API_KEY;

    if (!geminiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured (need GEMINI_API_KEY in .env.local)' }, { status: 500 });
    }

    console.log('Using Google Gemini for skill extraction');
    const prompt = `Extract a concise JSON array of skills/technologies found in the following resume text. Return only valid JSON (an array of strings). Do not include any explanation or extra text. Example output: ["JavaScript", "React", "Node.js"].\n\nResume text:\n${text}`;

    const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Gemini error', resp.status, errText);
      return NextResponse.json({ error: 'Gemini API request failed' }, { status: 502 });
    }

    const data = await resp.json();
    const message = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    if (!message) {
      console.error('No response from Gemini');
      return NextResponse.json({ error: 'No AI response received' }, { status: 502 });
    }
    
    console.log('Gemini response received, parsing skills...');

    // Try to parse JSON from message
    let skills = [];
    try {
      const match = message.match(/\[([\s\S]*?)\]/);
      if (match) {
        const arrText = match[0];
        const parsed = JSON.parse(arrText);
        if (Array.isArray(parsed)) skills = parsed.map(s => String(s).trim()).filter(Boolean);
      } else {
        const parsed = JSON.parse(message);
        if (Array.isArray(parsed)) skills = parsed.map(s => String(s).trim()).filter(Boolean);
      }
    } catch (e) {
      console.error('Failed to parse OpenAI response as JSON array', e, message);
      const quoted = Array.from(message.matchAll(/"([^\"]+)"/g)).map(m => m[1]);
      if (quoted.length) skills = quoted;
    }

    skills = Array.from(new Set(skills));

    return NextResponse.json({ skills });
  } catch (err) {
    console.error('AI skills error', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
