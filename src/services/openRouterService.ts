// openRouterService.ts - Free alternative to Gemini API
const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const API_BASE = 'https://openrouter.ai/api/v1';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

async function callOpenRouter(model: string, messages: Message[], options: { json?: boolean } = {}) {
  const response = await fetch(`${API_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': window.location.href,
      'X-Title': 'SmallBoat AI',
    },
    body: JSON.stringify({
      model,
      messages,
      ...(options.json && { response_format: { type: 'json_object' } }),
    }),
  });

  const data = await response.json();
  return data.choices?.[0]?.message?.content || '';
}

export const generateBrandStrategy = async (input: string) => {
  const systemPrompt = `You are an expert brand strategist and naming consultant.
  Based on this business idea: "${input}", create a comprehensive brand identity strategy.
  
  Return ONLY valid JSON with these exact fields (no other text):
  {
    "name": "Brand Name",
    "tagline": "Catchy tagline (max 6 words)",
    "colors": ["#hex1", "#hex2", "#hex3", "#hex4", "#hex5"],
    "fonts": ["Primary Font Name", "Secondary Font Name"],
    "targetAudience": "Detailed description of ideal customers",
    "mission": "2-3 sentence brand mission",
    "logoPrompt": "Detailed AI image prompt for logo generation"
  }`;

  const result = await callOpenRouter(
    'anthropic/claude-3.5-sonnet-20241022',
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Create a brand strategy for: ${input}` }
    ],
    { json: true }
  );

  return JSON.parse(result);
};

export const getMarketInsights = async (brandName: string, niche: string) => {
  const systemPrompt = `You are a market research analyst.
  Analyze the competitive landscape for a brand called "${brandName}" in the "${niche}" industry.
  
  Return ONLY valid JSON array with these exact fields:
  [
    {
      "competitor": "Competitor Name",
      "strength": "Their main strength (max 10 words)",
      "weakness": "Their weakness (max 10 words)",
      "opportunity": "Your opportunity to beat them (max 10 words)",
      "sourceUrl": "https://example.com"
    }
  ]`;

  const result = await callOpenRouter(
    'perplexity/llama-3.1-sonar-small-128k-online',
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: `Research competitors for ${brandName} in ${niche}` }
    ],
    { json: true }
  );

  try {
    return JSON.parse(result);
  } catch {
    return [
      { competitor: "Leading Competitor", strength: "Strong brand", weakness: "Expensive", opportunity: "Better pricing", sourceUrl: "" }
    ];
  }
};

export const generateLogo = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE}/images/generations`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.href,
        'X-Title': 'SmallBoat AI',
      },
      body: JSON.stringify({
        model: 'black-forest-labs/flux-pro-1.1',
        prompt: `${prompt}, minimalist logo, clean vector style, transparent background, professional, high quality, modern`,
        size: '1024x1024',
      }),
    });

    const data = await response.json();
    return data.data?.[0]?.url || '';
  } catch (error) {
    console.error('Logo generation error:', error);
    return '';
  }
};
