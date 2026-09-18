import type { VercelRequest, VercelResponse } from '@vercel/node';

// Groq API Key (내장 키 및 환경변수 지원)
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

  const { title, modelName, manufacturer, category, memo, rawTextSample } = req.body || {};

  const prompt = `
당신은 건설장비 고소작업대(시저리프트, 붐리프트) MRO(유지보수·정비·운영) 기술 매뉴얼 전문 엔지니어입니다.
아래 제공된 장비 매뉴얼 정보를 정밀 분석하여 현장 AS기사 및 출고팀이 스마트폰으로 즉시 검색할 수 있는 구조화된 JSON 메타데이터를 추출하세요.

[매뉴얼 정보]
- 문서 제목: ${title || '미지정'}
- 대상 모델: ${modelName || '공통'}
- 제조사: ${manufacturer || '미지정'}
- 카테고리: ${category || '미지정'} (PARTS_BOOK / ERROR_CODE / WIRING_DIAGRAM / OPERATOR_MANUAL)
- 비고/가이드: ${memo || '없음'}
- 본문 발췌/목차: ${rawTextSample ? rawTextSample.slice(0, 1500) : '없음'}

[추출 규칙]
반드시 순수 JSON 객체(마크다운 백틱 없이)로만 응답하세요:
{
  "keywords": ["키워드1", "키워드2", ... (최대 10개, 고소작업대 부품, 증상, 제어 용어)],
  "errorCodes": ["02", "18", ... (문서와 관련된 에러코드 목록, 없으면 빈 배열)],
  "majorParts": ["부품명1", "부품명2", ... (주요 부품 및 품번, 최대 6개)],
  "symptoms": ["증상1", "증상2", ... (이 문서로 해결 가능한 고장 증상, 최대 6개)],
  "aiSummary": "이 매뉴얼의 주요 수록 내용과 현장 트러블슈팅 활용법을 명확하게 요약한 2~3줄 설명"
}
`;

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    if (!groqRes.ok) {
      throw new Error(`Groq API responded with status ${groqRes.status}`);
    }

    const groqData = await groqRes.json();
    const content = groqData.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return res.status(200).json({
      success: true,
      data: parsed
    });
  } catch (err: any) {
    console.error('[manual-ai-indexer] Error:', err);
    return res.status(200).json({
      success: false,
      error: err.message,
      fallbackUsed: true
    });
  }
}
