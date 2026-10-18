/*
# Create chat history tables (conversations + messages)

1. New Tables
- `conversations`
  - `id` (uuid, primary key)
  - `title` (text, not null) — auto-derived from first user message
  - `agent_id` (text, not null) — which agent handled the conversation
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now()) — bumped on every new message
- `messages`
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, foreign key to conversations, cascade delete)
  - `role` (text, not null) — 'user' | 'assistant' | 'system'
  - `content` (text, not null) — message body (markdown for assistant)
  - `sources` (jsonb, nullable) — citation metadata array
  - `status` (text, default 'complete') — 'streaming' | 'complete' | 'failed'
  - `feedback` (text, nullable) — 'up' | 'down' | null
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on both tables.
- Single-tenant app (no sign-in screen yet): allow anon + authenticated full CRUD.
- Data is intentionally shared/public across the workspace in this demo phase.

3. Indexes
- `messages_conversation_id_idx` — fast conversation message lookups
- `conversations_updated_at_idx` — sorted conversation list

4. Notes
- Cascade delete ensures deleting a conversation removes all its messages.
- `sources` is jsonb so citation shape can evolve without migrations.
*/

CREATE TABLE IF NOT EXISTS conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'New conversation',
  agent_id text NOT NULL DEFAULT 'AGT-002',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL DEFAULT '',
  sources jsonb,
  status text NOT NULL DEFAULT 'complete' CHECK (status IN ('streaming', 'complete', 'failed')),
  feedback text CHECK (feedback IN ('up', 'down')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_conversations" ON conversations;
CREATE POLICY "anon_select_conversations" ON conversations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_conversations" ON conversations;
CREATE POLICY "anon_insert_conversations" ON conversations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_conversations" ON conversations;
CREATE POLICY "anon_update_conversations" ON conversations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_conversations" ON conversations;
CREATE POLICY "anon_delete_conversations" ON conversations FOR DELETE
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_select_messages" ON messages;
CREATE POLICY "anon_select_messages" ON messages FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_messages" ON messages;
CREATE POLICY "anon_insert_messages" ON messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_messages" ON messages;
CREATE POLICY "anon_update_messages" ON messages FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_messages" ON messages;
CREATE POLICY "anon_delete_messages" ON messages FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS messages_conversation_id_idx ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS conversations_updated_at_idx ON conversations(updated_at DESC);
