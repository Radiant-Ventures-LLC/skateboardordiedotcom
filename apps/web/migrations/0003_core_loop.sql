-- skateboardordie.com — the core loop
-- claim a handle and home spot → pin and tend spots → post a clip at a spot
-- → find your crew → shape the charter.
--
-- Conventions (same as 0001/0002): random UUID text ids, UTC timestamps in
-- SQLite's datetime('now') format. New here: CHECK constraints on every
-- closed set and range, so bad values fail at the database, not just the API.
-- D1 enforces foreign keys. Content that a moderator takes down, and crews that
-- disband, are marked status = 'removed' rather than deleted, so reports can
-- still point at them and crew-only spots stay hidden.

-- ---------------------------------------------------------------------------
-- Crews
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS crews (
  id           TEXT PRIMARY KEY,
  slug         TEXT NOT NULL,                     -- URL name: /crew/<slug>
  name         TEXT NOT NULL,
  city         TEXT,
  bio          TEXT,
  join_policy  TEXT NOT NULL DEFAULT 'request'
               CHECK (join_policy IN ('open', 'request')),
  status       TEXT NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'removed')),
  created_by   TEXT REFERENCES users (id) ON DELETE SET NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_crews_slug ON crews (lower(slug));
CREATE INDEX IF NOT EXISTS idx_crews_city ON crews (city);

-- A skater can ride with more than one crew. 'requested' = asked to join a
-- 'request' crew; 'invited' = a lead asked them. Only 'active' rows count.
CREATE TABLE IF NOT EXISTS crew_members (
  crew_id     TEXT NOT NULL REFERENCES crews (id) ON DELETE CASCADE,
  user_id     TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('lead', 'member')),
  status      TEXT NOT NULL DEFAULT 'active'
              CHECK (status IN ('active', 'requested', 'invited')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  joined_at   TEXT,
  PRIMARY KEY (crew_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_crew_members_user ON crew_members (user_id, status);

-- ---------------------------------------------------------------------------
-- Spots (the commons)
-- ---------------------------------------------------------------------------
-- Visibility protects spots from getting busted:
--   'public'      exact pin for everyone (parks, plazas, legal spots)
--   'approximate' everyone else sees public_lat/lng, offset 150–400 m ONCE at
--                 creation and stored, so repeat lookups can't be averaged
--                 back to the real spot. Exact pin: the creator, members of
--                 crew_id, and mods.
--   'crew'        only members of crew_id (required) see it at all.
-- lat/lng must never be sent to someone who can't see the exact pin.
CREATE TABLE IF NOT EXISTS spots (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  description  TEXT,
  city         TEXT,                              -- city slug, for waves and the city feed
  lat          REAL NOT NULL CHECK (lat BETWEEN -90 AND 90),
  lng          REAL NOT NULL CHECK (lng BETWEEN -180 AND 180),
  public_lat   REAL NOT NULL CHECK (public_lat BETWEEN -90 AND 90),
  public_lng   REAL NOT NULL CHECK (public_lng BETWEEN -180 AND 180),
  visibility   TEXT NOT NULL DEFAULT 'approximate'
               CHECK (visibility IN ('public', 'approximate', 'crew')),
  -- No ON DELETE action: a crew that still has spots can't be deleted, so its
  -- crew-only spots never fall back to being visible. Disband = status 'removed'.
  crew_id      TEXT REFERENCES crews (id),
  -- Latest report, copied from spot_updates so the map needs no join.
  condition    TEXT CHECK (condition IN ('skateable', 'rough', 'blocked')),
  bust         INTEGER CHECK (bust BETWEEN 0 AND 3),
  status       TEXT NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'gone', 'removed')),  -- gone = knobbed or demolished
  created_by   TEXT REFERENCES users (id) ON DELETE SET NULL,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (visibility <> 'crew' OR crew_id IS NOT NULL)
);
-- Map viewport queries: a lat range scan, then lng filtered.
CREATE INDEX IF NOT EXISTS idx_spots_public_pos ON spots (public_lat, public_lng) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_spots_city ON spots (city, status);
CREATE INDEX IF NOT EXISTS idx_spots_crew ON spots (crew_id) WHERE crew_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_spots_creator ON spots (created_by);

-- Free-form tags; the app offers a fixed list (ledge, rail, stairs, gap,
-- bank, transition, manual pad, DIY, park, plaza, flat).
CREATE TABLE IF NOT EXISTS spot_tags (
  spot_id  TEXT NOT NULL REFERENCES spots (id) ON DELETE CASCADE,
  tag      TEXT NOT NULL,
  PRIMARY KEY (spot_id, tag)
);
CREATE INDEX IF NOT EXISTS idx_spot_tags_tag ON spot_tags (tag);

-- Tending a spot: condition reports, bust factor and notes, newest first.
-- bust: 0 = nobody cares, 1 = sometimes, 2 = usually, 3 = instant kick-out.
CREATE TABLE IF NOT EXISTS spot_updates (
  id          TEXT PRIMARY KEY,
  spot_id     TEXT NOT NULL REFERENCES spots (id) ON DELETE CASCADE,
  user_id     TEXT REFERENCES users (id) ON DELETE SET NULL,
  condition   TEXT CHECK (condition IN ('skateable', 'rough', 'blocked', 'gone')),
  bust        INTEGER CHECK (bust BETWEEN 0 AND 3),
  note        TEXT,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'removed')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  CHECK (condition IS NOT NULL OR bust IS NOT NULL OR note IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_spot_updates_spot ON spot_updates (spot_id, created_at);

-- Photos are stored with GPS/EXIF already stripped (Phase 3 rule).
CREATE TABLE IF NOT EXISTS spot_photos (
  id          TEXT PRIMARY KEY,
  spot_id     TEXT NOT NULL REFERENCES spots (id) ON DELETE CASCADE,
  user_id     TEXT REFERENCES users (id) ON DELETE SET NULL,
  image_key   TEXT NOT NULL,                      -- R2 key or Images id
  width       INTEGER,
  height      INTEGER,
  status      TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'removed')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_spot_photos_spot ON spot_photos (spot_id, created_at);

-- ---------------------------------------------------------------------------
-- Profiles: the rest of what the waitlist promises (handle is in 0002).
-- ---------------------------------------------------------------------------
ALTER TABLE users ADD COLUMN city TEXT;                    -- city slug, e.g. 'austin-tx'
ALTER TABLE users ADD COLUMN bio TEXT;
ALTER TABLE users ADD COLUMN avatar_key TEXT;              -- image storage key
ALTER TABLE users ADD COLUMN home_spot_id TEXT REFERENCES spots (id) ON DELETE SET NULL;
-- The founding-skater mark. Set once (at account creation for founding waves)
-- and never handed out again.
ALTER TABLE users ADD COLUMN founding INTEGER NOT NULL DEFAULT 0 CHECK (founding IN (0, 1));

-- ---------------------------------------------------------------------------
-- Clips: phone video, always at a spot, always by a skater.
-- ---------------------------------------------------------------------------
-- A clip at a 'crew' spot must itself be 'crew' (the API enforces this; a
-- CHECK can't see the spot). Deleting an account deletes its clips; the app
-- must also delete the videos from storage. Spots with clips can't be hard
-- deleted (no ON DELETE action) — mark them 'removed' instead.
CREATE TABLE IF NOT EXISTS clips (
  id           TEXT PRIMARY KEY,
  user_id      TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  spot_id      TEXT NOT NULL REFERENCES spots (id),
  crew_id      TEXT REFERENCES crews (id),       -- posted to this crew's feed (no ON DELETE: see spots)
  video_id     TEXT UNIQUE,                       -- Stream video uid (or storage key)
  caption      TEXT,
  duration_s   REAL CHECK (duration_s IS NULL OR duration_s > 0),
  visibility   TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'crew')),
  status       TEXT NOT NULL DEFAULT 'uploading'
               CHECK (status IN ('uploading', 'processing', 'ready', 'failed', 'removed')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  published_at TEXT,                              -- set when status becomes 'ready'
  CHECK (visibility <> 'crew' OR crew_id IS NOT NULL)
);
-- Feeds are chronological: crew first (members' clips), then city (via spot).
CREATE INDEX IF NOT EXISTS idx_clips_ready ON clips (published_at) WHERE status = 'ready';
CREATE INDEX IF NOT EXISTS idx_clips_user ON clips (user_id, published_at);
CREATE INDEX IF NOT EXISTS idx_clips_spot ON clips (spot_id, published_at);
CREATE INDEX IF NOT EXISTS idx_clips_crew ON clips (crew_id, published_at) WHERE crew_id IS NOT NULL;

-- ---------------------------------------------------------------------------
-- Charter v0: site-wide proposals and votes. Passed proposals are the charter.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proposals (
  id          TEXT PRIMARY KEY,
  author_id   TEXT REFERENCES users (id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'open'
              CHECK (status IN ('open', 'passed', 'failed', 'withdrawn', 'removed')),
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  closes_at   TEXT NOT NULL,
  decided_at  TEXT
);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals (status, closes_at);

-- One vote per skater per proposal; changing your mind updates the row.
CREATE TABLE IF NOT EXISTS votes (
  proposal_id  TEXT NOT NULL REFERENCES proposals (id) ON DELETE CASCADE,
  user_id      TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  choice       TEXT NOT NULL CHECK (choice IN ('yes', 'no', 'abstain')),
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (proposal_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_votes_user ON votes (user_id);
