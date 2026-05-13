const fetch = require('node-fetch');

const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;

const WORKFLOW_SYSTEM = `You are an AI workflow designer for Agentic Labs. Generate specific, realistic agentic AI agent stacks for small businesses. Always return valid JSON only — no markdown, no code fences, no explanation.`;

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).end();

    const { industry } = req.body;
    if (!industry) return res.status(400).json({ error: 'industry required' });

    const userPrompt = `Generate a 4-agent AI stack for a ${industry}. Return JSON matching this exact schema:
{
  "workflow_title": "string",
  "workflow_subtitle": "string",
  "agents": [
    {
      "name": "string",
      "role": "string",
      "description": "string (one sentence, what this agent does)",
      "tasks": ["string", "string", "string"]
    }
  ],
  "outcomes": [
    { "metric": "string", "description": "string" },
    { "metric": "string", "description": "string" },
    { "metric": "string", "description": "string" }
  ]
}
Make agents highly specific to a ${industry}. Tasks should be short, concrete actions the agent performs. Outcome metrics should be concrete and impressive but believable (e.g. "68% faster", "12 hrs/week saved", "$4,200 recovered").`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-api-key': ANTHROPIC_KEY,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-5',
            max_tokens: 1600,
            system: WORKFLOW_SYSTEM,
            messages: [{ role: 'user', content: userPrompt }],
        }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message });
    res.json(data);
};
