const fetch = require('node-fetch');

const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;

const CHAT_SYSTEM = `You are an AI assistant for Agentic Labs, a company that helps small businesses implement custom AI agent workflows. Your job is to understand what type of business the visitor has, what their biggest operational challenges are, and recommend which AI agents from our library would help them most. Our agents include: Customer Service Bot, Executive Assistant, Business Analyst, Lead Gen Agent, Inventory Agent, and Social Media Agent. Be conversational, ask qualifying questions, and always end by encouraging them to fill out the Message Us form. Never discuss pricing specifics - say pricing varies based on their needs.`;

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).end();

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'messages array is required' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            'x-api-key': ANTHROPIC_KEY,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-haiku-4-5',
            max_tokens: 500,
            system: CHAT_SYSTEM,
            messages,
        }),
    });

    const data = await response.json();
    if (!response.ok) return res.status(response.status).json({ error: data?.error?.message });
    res.json(data);
};
