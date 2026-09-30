-- NOXIA core data model. Additive migration only.
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE, display_name TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS workspaces (
  id TEXT PRIMARY KEY, owner_user_id TEXT NOT NULL, name TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(owner_user_id) REFERENCES users(id)
);
CREATE TABLE IF NOT EXISTS credit_accounts (
  workspace_id TEXT PRIMARY KEY, balance INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
);
CREATE TABLE IF NOT EXISTS credit_ledger (
  id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, amount INTEGER NOT NULL, reason TEXT NOT NULL, reference_id TEXT, created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
);
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, title TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'draft', aspect_ratio TEXT NOT NULL DEFAULT '9:16', duration_seconds INTEGER NOT NULL DEFAULT 8, created_at TEXT NOT NULL DEFAULT (datetime('now')), updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
);
CREATE TABLE IF NOT EXISTS generations (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'queued', provider TEXT, provider_job_id TEXT, prompt TEXT NOT NULL, credits_reserved INTEGER NOT NULL DEFAULT 0, output_url TEXT, error_code TEXT, model TEXT, aspect_ratio TEXT NOT NULL DEFAULT '9:16', duration_seconds INTEGER NOT NULL DEFAULT 8, idempotency_key TEXT NOT NULL UNIQUE, created_at TEXT NOT NULL DEFAULT (datetime('now')), completed_at TEXT,
  FOREIGN KEY(project_id) REFERENCES projects(id)
);
CREATE TABLE IF NOT EXISTS purchases (
  id TEXT PRIMARY KEY, workspace_id TEXT NOT NULL, provider TEXT NOT NULL, external_payment_id TEXT, credits INTEGER NOT NULL, amount_minor INTEGER NOT NULL, currency TEXT NOT NULL DEFAULT 'TRY', status TEXT NOT NULL DEFAULT 'pending', created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(workspace_id) REFERENCES workspaces(id)
);
CREATE TABLE IF NOT EXISTS provider_usage (
  id TEXT PRIMARY KEY, generation_id TEXT NOT NULL, provider TEXT NOT NULL, model TEXT, seconds REAL, cost_usd REAL NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(generation_id) REFERENCES generations(id)
);
CREATE TABLE IF NOT EXISTS trend_items (
  id TEXT PRIMARY KEY, source TEXT NOT NULL, region TEXT NOT NULL, category TEXT, title TEXT NOT NULL, signal REAL, source_url TEXT, observed_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_projects_workspace ON projects(workspace_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_generations_project ON generations(project_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_generations_idempotency ON generations(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_workspace ON credit_ledger(workspace_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trends_region_time ON trend_items(region, observed_at DESC);
