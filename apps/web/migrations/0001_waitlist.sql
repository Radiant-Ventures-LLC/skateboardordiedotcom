-- skateboardordie.com — early-access waitlist
-- One row per signup. `source` captures how they found Paradise (ref/utm),
-- so outreach to each skate community can be measured for what actually converts.
CREATE TABLE IF NOT EXISTS waitlist (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  email       TEXT    NOT NULL,
  handle      TEXT,             -- optional: skater handle / @
  city        TEXT,             -- optional: where they skate
  source      TEXT,             -- referral/utm_source (e.g. "reddit", "slap", "ig")
  user_agent  TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
);

-- Case-insensitive uniqueness so bro@x.com and BRO@x.com don't double-sign.
CREATE UNIQUE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist (lower(email));

-- Fast rollups by acquisition channel for PR reporting.
CREATE INDEX IF NOT EXISTS idx_waitlist_source ON waitlist (source);
