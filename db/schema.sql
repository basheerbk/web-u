CREATE TABLE IF NOT EXISTS coffee_notes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name VARCHAR(80) NOT NULL DEFAULT 'Anonymous',
  message VARCHAR(1200) NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'approved', 'archived')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS coffee_notes_status_created_at_idx
  ON coffee_notes (status, created_at DESC);
