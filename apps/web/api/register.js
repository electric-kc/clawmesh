import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const card = req.body;

  // Basic validation
  const required = ['id', 'name', 'version', 'endpoint', 'protocols', 'capabilities'];
  for (const field of required) {
    if (!card[field]) {
      return res.status(400).json({ error: `Missing required field: ${field}` });
    }
  }

  // Validate id format
  if (!/^agent_[a-z0-9_]+$/.test(card.id)) {
    return res.status(400).json({ 
      error: 'Invalid agent id format. Use: agent_yourname_001' 
    });
  }

  // Check for duplicate
  const { data: existing } = await supabase
    .from('agent_cards')
    .select('id')
    .eq('agent_id', card.id)
    .single();

  if (existing) {
    return res.status(409).json({ 
      error: `Agent ${card.id} already registered. Use /api/update to modify.` 
    });
  }

  // Insert
  const { error } = await supabase
    .from('agent_cards')
    .insert({
      agent_id: card.id,
      name: card.name,
      version: card.version,
      description: card.description || null,
      owner: card.owner || null,
      endpoint: card.endpoint,
      protocols: card.protocols,
      capabilities: card.capabilities,
      feeds: card.feeds || [],
      auth: card.auth || { type: 'none' },
      trust_level: card.trust?.level || 0,
      tags: card.tags || [],
      card_json: card,
      registered_at: new Date().toISOString()
    });

  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json({ error: 'Failed to register agent' });
  }

  return res.status(201).json({
    success: true,
    message: `Agent ${card.id} registered to ClawMesh`,
    registry_url: `https://clawmesh.io/registry/${card.id}`,
    card_id: card.id
  });
}
