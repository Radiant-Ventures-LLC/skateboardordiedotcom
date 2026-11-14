-- skateboardordie.com — accounts and sign-in
-- Passkeys first; an emailed one-time link when a skater has no passkey on
-- this device yet. Beta opens in waves, so new accounts need an invite.
-- Timestamps use SQLite's datetime('now') format (UTC), like the waitlist.

CREATE TABLE IF NOT EXISTS users (
  id            TEXT PRIMARY KEY,                 -- random UUID
  email         TEXT NOT NULL,
  handle        TEXT,                             -- claimed at onboarding (Phase 2)
  role          TEXT NOT NULL DEFAULT 'skater',   -- 'skater' | 'mod' | 'admin'
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_seen_at  TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_handle ON users (lower(handle)) WHERE handle IS NOT NULL;

-- Who may create an account. Rows are added per wave (and later by crews).
CREATE TABLE IF NOT EXISTS invites (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  email        TEXT NOT NULL,
  wave         TEXT,                              -- e.g. 'founders', 'wave-1-austin'
  invited_by   TEXT REFERENCES users (id) ON DELETE SET NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  redeemed_at  TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_invites_email ON invites (lower(email));

-- Signed-in browsers. The cookie holds a random token; only its SHA-256 is
-- stored, so a database leak can't be replayed as live sessions.
CREATE TABLE IF NOT EXISTS sessions (
  id_hash     TEXT PRIMARY KEY,
  user_id     TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT NOT NULL,
  user_agent  TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions (user_id);

CREATE TABLE IF NOT EXISTS passkeys (
  id            TEXT PRIMARY KEY,                 -- credential ID (base64url)
  user_id       TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  public_key    TEXT NOT NULL,                    -- COSE key, base64url
  counter       INTEGER NOT NULL DEFAULT 0,
  transports    TEXT,                             -- JSON array
  device_type   TEXT,                             -- 'singleDevice' | 'multiDevice'
  backed_up     INTEGER NOT NULL DEFAULT 0,
  name          TEXT,                             -- e.g. 'iCloud Keychain'
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  last_used_at  TEXT
);
CREATE INDEX IF NOT EXISTS idx_passkeys_user ON passkeys (user_id);

-- One-time WebAuthn challenges (5 minutes, consumed on verify).
CREATE TABLE IF NOT EXISTS auth_challenges (
  id          TEXT PRIMARY KEY,
  challenge   TEXT NOT NULL,
  kind        TEXT NOT NULL,                      -- 'login' | 'register'
  user_id     TEXT REFERENCES users (id) ON DELETE CASCADE,
  expires_at  TEXT NOT NULL
);

-- Every sign-in email sent. 'signin' rows carry the hashed one-time token;
-- 'nopass' rows (no invite yet) don't. Also used to throttle per address.
CREATE TABLE IF NOT EXISTS auth_emails (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT NOT NULL,
  kind        TEXT NOT NULL,                      -- 'signin' | 'nopass'
  token_hash  TEXT UNIQUE,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at  TEXT,
  used_at     TEXT
);
CREATE INDEX IF NOT EXISTS idx_auth_emails_email ON auth_emails (lower(email), created_at);
