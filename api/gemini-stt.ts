import type { VercelRequest, VercelResponse } from '@vercel/node';

// Gemini STT is permanently disabled to prevent developer/user billing.
// System strictly standardizes on 100% free Browser Web Speech API.
export default async function handler(req: VercelRequest, res: VercelResponse) {
  return res.status(410).json({
    error: 'Gemini STT is permanently disabled. Free Browser Web Speech API is used.',
    disabled: true
  });
}
