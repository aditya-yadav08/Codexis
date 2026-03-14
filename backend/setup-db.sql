-- 1. Add Missing Columns to 'repos'
ALTER TABLE repos ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES users(id);
ALTER TABLE repos ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE repos ADD COLUMN IF NOT EXISTS indexing_error TEXT;

-- 2. Create Performance Indexes
-- Index for user-specific repo list (Dashboard)
CREATE INDEX IF NOT EXISTS idx_repos_user_id ON repos(user_id);

-- Index for searching repos by owner/repo (Common for chat and lookups)
CREATE INDEX IF NOT EXISTS idx_repos_owner_repo ON repos(owner, repo);

-- Index for code chunks retrieval (AI Search)
CREATE INDEX IF NOT EXISTS idx_code_chunks_owner_repo ON code_chunks(owner, repo);

-- Index for github tokens (Auth Synchronization)
CREATE INDEX IF NOT EXISTS idx_github_tokens_user_id ON github_tokens(user_id);

-- 3. (Optional but recommended) Comment for clarity
COMMENT ON COLUMN repos.status IS 'Status of indexing: pending, indexing, completed, failed';
