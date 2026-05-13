const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);

module.exports = async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') return res.status(200).end();
    if (req.method !== 'POST') return res.status(405).end();

    const { name, email, business_type, message } = req.body;
    if (!name || !email || !business_type || !message) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const { error } = await supabase
        .from('contacts')
        .insert([{ name, email, business_type, message, created_at: new Date().toISOString() }]);

    if (error) return res.status(500).json({ error: error.message });
    res.json({ success: true });
};
