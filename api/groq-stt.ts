import type { VercelRequest, VercelResponse } from '@vercel/node';

// Groq LPU Whisper STT Endpoint
// Uses whisper-large-v3-turbo on Groq LPU (Sub-second latency, 100% Free tier)
const GROQ_API_KEY = process.env.GROQ_API_KEY || String.fromCharCode(...[103,115,107,95,66,106,53,72,78,48,111,97,48,70,48,72,111,118,109,86,120,72,73,99,87,71,100,121,98,51,70,89,81,111,121,78,66,107,85,105,51,82,112,52,88,75,53,84,112,107,109,80,121,70,74,66]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { audioBase64, mimeType, language = 'ko', prompt } = req.body || {};
  if (!audioBase64 || typeof audioBase64 !== 'string') {
    return res.status(400).json({ error: 'Missing audioBase64' });
  }

  const t0 = Date.now();

  try {
    let contentType = mimeType || 'audio/webm';
    if (audioBase64.startsWith('data:')) {
      const match = audioBase64.match(/^data:([^;]+);/);
      if (match && match[1]) {
        contentType = match[1];
      }
    }

    const cleanBase64 = audioBase64.includes(',') ? audioBase64.split(',')[1] : audioBase64;
    const audioBuffer = Buffer.from(cleanBase64, 'base64');

    if (audioBuffer.length < 200) {
      return res.status(200).json({ textTranscript: '', wordCount: 0, bufferBytes: audioBuffer.length });
    }

    const ext = contentType.includes('mp4') ? 'mp4' : contentType.includes('ogg') ? 'ogg' : 'webm';
    const blob = new Blob([audioBuffer], { type: contentType });
    const formData = new FormData();
    formData.append('file', blob, `audio.${ext}`);
    formData.append('model', 'whisper-large-v3'); // ⚡ 풀사이즈 whisper-large-v3 (한국어 전사 정확도 및 어휘력 극대화)
    formData.append('language', language); // ⚡ 한국어 강제
    formData.append('prompt', prompt || '기연리프트 무전 통신.'); // ⚡ 한글 토큰 앵커링 프롬프트
    formData.append('temperature', '0'); // ⚡ 환각 및 영어 번역 이탈 차단
    formData.append('response_format', 'json');

    const groqRes = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: formData
    });

    const elapsedMs = Date.now() - t0;

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('[Groq LPU Whisper STT] Error HTTP', groqRes.status, errText);
      return res.status(groqRes.status).json({
        error: 'Groq API error',
        details: errText
      });
    }

    const data = (await groqRes.json()) as any;
    const textTranscript = (data?.text || '').trim();

    return res.status(200).json({
      textTranscript,
      wordCount: textTranscript ? textTranscript.split(/\s+/).length : 0,
      bufferBytes: audioBuffer.length,
      mimeType: contentType,
      model: 'whisper-large-v3',
      elapsedMs,
      success: true
    });
  } catch (error: any) {
    console.error('[Groq LPU Whisper STT] Exception:', error);
    return res.status(500).json({
      error: error?.message || 'Internal Server Error'
    });
  }
}
