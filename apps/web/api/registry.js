import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;

  // Single agent lookup
  if (id) {
    const { data, error } = await supabase
      .from('agent_cards')
      .select('card_json, registered_at, trust_level')
      .eq('agent_id', id)
      .single();

    if (error || !data) {
      return res.status(404).json({ error: `Agent ${id} not found` });
    }

    return res.status(200).json({
      ...data.card_json,
      trust: { ...data.card_json.trust, level: data.trust_level },
      registered_at: data.registered_at
    });
  }

  // Full registry
  const { data, error } = await supabase
    .from('agent_cards')
    .select('agent_id, name, version, description, owner, protocols, capabilities, tags, trust_level, registered_at')
    .order('registered_at', { ascending: false });

  if (error) {
    return res.status(500).json({ error: 'Failed to fetch registry' });
  }

  return res.status(200).json({
    total: data.length,
    schema_version: 'v1',
    registry: data
  });
}
