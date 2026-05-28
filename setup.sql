-- ============================================================
--  Run this entire script in pgAdmin's Query Tool
--  (Database: school_db)
-- ============================================================

-- 1. Create the database (run this once in the default 'postgres' DB)
--    Skip if you already have a database you want to use.
-- CREATE DATABASE school_db;

-- 2. Connect to school_db, then run the rest:

-- 3. Create the students table
CREATE TABLE IF NOT EXISTS students (
    id               SERIAL PRIMARY KEY,
    name             VARCHAR(100)  NOT NULL,
    class            VARCHAR(20)   NOT NULL,
    favorite_subject VARCHAR(50)   NOT NULL
                     CHECK (favorite_subject IN ('Hindi','English','Math','Science','Social Science')),
    age              SMALLINT      NOT NULL CHECK (age >= 3 AND age <= 25),
    email            VARCHAR(150)  NOT NULL UNIQUE,
    created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- 4. (Optional) Verify the table was created
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'students'
ORDER BY ordinal_position;
