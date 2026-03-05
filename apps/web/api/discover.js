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

  const { capability, domain, protocol, tag, limit = 20 } = req.query;

  let query = supabase
    .from('agent_cards')
    .select('agent_id, name, version, description, owner, endpoint, protocols, capabilities, tags, trust_level, registered_at')
    .order('trust_level', { ascending: false })
    .order('registered_at', { ascending: false })
    .limit(Math.min(parseInt(limit), 100));

  // Filter by protocol
  if (protocol) {
    query = query.contains('protocols', [protocol.toUpperCase()]);
  }

  // Filter by tag
  if (tag) {
    query = query.contains('tags', [tag.toLowerCase()]);
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: 'Discovery query failed' });
  }

  let results = data;

  // Filter by capability (search inside capabilities array)
  if (capability) {
    const search = capability.toLowerCase();
    results = results.filter(agent =>
      agent.capabilities?.some(cap =>
        cap.id?.toLowerCase().includes(search) ||
        cap.description?.toLowerCase().includes(search) ||
        cap.domain?.toLowerCase().includes(search)
      )
    );
  }

  // Filter by domain
  if (domain) {
    const search = domain.toLowerCase();
    results = results.filter(agent =>
      agent.capabilities?.some(cap =>
        cap.domain?.toLowerCase().includes(search)
      )
    );
  }

  return res.status(200).json({
    count: results.length,
    agents: results,
    query: { capability, domain, protocol, tag }
  });
}
