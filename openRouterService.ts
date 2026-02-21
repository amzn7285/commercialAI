const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_BASE = 'https://openrouter.ai/api/v1';

async function callOpenRouter(model: string, messages: any[], json = false) {
  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.href,
      'X-Title': 'SmallBoat AI',
    },
    body: JSON.stringify({ model, messages, ...(json && { response_format: { type: 'json_object' } }) }),
  });
  return response.json().then(d => d.choices?.[0]?.message?.content || '');
}

export const generateBrandStrategy = async (input: string) => {
  const prompt = `Create brand strategy JSON for "${input}". Return: name, tagline, colors (5 hex), fonts (2), targetAudience, mission, logoPrompt.`;
  const result = await callOpenRouter('anthropic/claude-3.5-sonnet-20241022', [
    { role: 'system', content: 'You are brand strategist. Return ONLY valid JSON.' },
    { role: 'user', content: prompt }
  ], true);
  return JSON.parse(result);
};

export const getMarketInsights = async (brandName: string, niche: string) => {
  const prompt = `3 competitors for ${brandName} in ${niche}. Return JSON array: competitor, strength, weakness, opportunity, sourceUrl.`;
  const result = await callOpenRouter('perplexity/llama-3.1-sonar-small-128k-online', [
    { role: 'system', content: 'You are market analyst. Return ONLY JSON array.' },
    { role: 'user', content: prompt }
  ], true);
  try { return JSON.parse(result); } catch { return []; }
};

export const generateLogo = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE}/images/generations`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${API_KEY}`, 'Content-Type': 'application/json', 'HTTP-Referer': window.location.href, 'X-Title': 'SmallBoat AI' },
      body: JSON.stringify({ model: 'black-forest-labs/flux-pro-1.1', prompt: prompt + ', minimalist logo, transparent, vector', size: '1024x1024' }),
    });
    const data = await response.json();
    return data.data?.[0]?.url || '';
  } catch { return ''; }
};
