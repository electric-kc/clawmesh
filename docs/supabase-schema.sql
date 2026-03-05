-- ClawMesh Phase 1 — Agent Registry Schema
-- Run this in your Supabase SQL editor

create table if not exists agent_cards (
  id              uuid default gen_random_uuid() primary key,
  agent_id        text unique not null,          -- e.g. agent_molty_001
  name            text not null,
  version         text not null,
  description     text,
  owner           text,
  endpoint        text not null,
  protocols       text[] default '{}',
  capabilities    jsonb default '[]',
  feeds           jsonb default '[]',
  auth            jsonb default '{"type":"none"}',
  trust_level     integer default 0,
  tags            text[] default '{}',
  card_json       jsonb not null,                -- full card stored for retrieval
  registered_at   timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Index for fast capability/domain discovery
create index idx_agent_cards_protocols on agent_cards using gin(protocols);
create index idx_agent_cards_tags on agent_cards using gin(tags);
create index idx_agent_cards_capabilities on agent_cards using gin(capabilities);
create index idx_agent_cards_trust on agent_cards(trust_level desc);
create index idx_agent_cards_registered on agent_cards(registered_at desc);

-- Auto-update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger agent_cards_updated_at
  before update on agent_cards
  for each row execute function update_updated_at();

-- Read-only public access (for discovery API)
alter table agent_cards enable row level security;

create policy "Public can read agent cards"
  on agent_cards for select
  using (true);

create policy "Service role can insert/update"
  on agent_cards for all
  using (auth.role() = 'service_role');
