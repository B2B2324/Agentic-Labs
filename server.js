const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

const app = express();
app.use(cors());
app.use(express.json());

const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_HEADERS = {
    'content-type': 'application/json',
    'x-api-key': ANTHROPIC_KEY,
    'anthropic-version': '2023-06-01',
};

const WORKFLOW_SYSTEM = `You are an AI workflow designer for Agentic Labs. Generate specific, realistic agentic AI agent stacks for small businesses. Always return valid JSON only — no markdown, no code fences, no explanation.`;

app.post('/api/generate', async (req, res) => {
    const { industry } = req.body;
    if (!industry) return res.status(400).json({ error: 'industry is required' });

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

    try {
        const response = await fetch(ANTHROPIC_URL, {
            method: 'POST',
            headers: ANTHROPIC_HEADERS,
            body: JSON.stringify({
                model: 'claude-sonnet-4-5',
                max_tokens: 1600,
                system: WORKFLOW_SYSTEM,
                messages: [{ role: 'user', content: userPrompt }],
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({ error: data?.error?.message || 'Anthropic API error' });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const CHAT_SYSTEM = `You are an AI assistant for Agentic Labs, a company that helps small businesses implement custom AI agent workflows. Your job is to understand what type of business the visitor has, what their biggest operational challenges are, and recommend which AI agents from our library would help them most. Our agents include: Customer Service Bot, Executive Assistant, Business Analyst, Lead Gen Agent, Inventory Agent, and Social Media Agent. Be conversational, ask qualifying questions, and always end by encouraging them to fill out the Message Us form. Never discuss pricing specifics - say pricing varies based on their needs.`;

app.post('/api/chat', async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required' });
    }

    try {
        const response = await fetch(ANTHROPIC_URL, {
            method: 'POST',
            headers: ANTHROPIC_HEADERS,
            body: JSON.stringify({
                model: 'claude-haiku-4-5',
                max_tokens: 500,
                system: CHAT_SYSTEM,
                messages,
            }),
        });

        const data = await response.json();
        if (!response.ok) {
            return res.status(response.status).json({ error: data?.error?.message || 'Anthropic API error' });
        }
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/contact', async (req, res) => {
    const { name, email, business_type, message } = req.body;
    if (!name || !email || !business_type || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const { error } = await supabase
        .from('contacts')
        .insert([{ name, email, business_type, message, created_at: new Date().toISOString() }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
});

if (require.main === module) {
    app.listen(3001, () => {
        console.log('Proxy server running on http://localhost:3001');
    });
}

module.exports = app;
