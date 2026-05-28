// server.js
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
const PORT = 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.static('public')); // serves index.html from /public folder

// ─── PostgreSQL Connection Pool ───────────────────────────────────────────────
const pool = new Pool({
  host:     'localhost',
  port:     5432,
  database: 'fullstack_project',     // ← change to your DB name
  user:     'postgres',      // ← change to your PostgreSQL username
  password: '@SANSKARJAIN6694', // ← change to your PostgreSQL password
});

// Test DB connection on startup
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌  Database connection failed:', err.message);
  } else {
    console.log('✅  Connected to PostgreSQL');
    release();
  }
});

// ─── Validation Helper ────────────────────────────────────────────────────────
const VALID_SUBJECTS = ['Hindi', 'English', 'Math', 'Science', 'Social Science'];

function validateBody(body) {
  const { name, class: studentClass, subject, age, email } = body;
  const errors = [];

  if (!name || String(name).trim().length < 2)
    errors.push('Name must be at least 2 characters.');

  if (!studentClass || String(studentClass).trim().length === 0)
    errors.push('Class is required.');

  if (!subject || !VALID_SUBJECTS.includes(subject))
    errors.push(`Subject must be one of: ${VALID_SUBJECTS.join(', ')}.`);

  const ageNum = Number(age);
  if (!age || isNaN(ageNum) || ageNum < 3 || ageNum > 25)
    errors.push('Age must be a number between 3 and 25.');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email))
    errors.push('A valid email address is required.');

  return errors;
}

// ─── POST /submit ─────────────────────────────────────────────────────────────
app.post('/submit', async (req, res) => {
  const errors = validateBody(req.body);
  if (errors.length > 0) {
    return res.status(400).json({ error: errors.join(' ') });
  }

  const { name, class: studentClass, subject, age, email } = req.body;

  const query = `
    INSERT INTO students (name, class, favorite_subject, age, email)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, name, class, favorite_subject, age, email, created_at;
  `;

  try {
    const result = await pool.query(query, [
      name.trim(),
      String(studentClass).trim(),
      subject,
      Number(age),
      email.trim().toLowerCase(),
    ]);
    return res.status(201).json({
      message: 'Student registered successfully!',
      student: result.rows[0],
    });
  } catch (err) {
    console.error('DB Insert Error:', err.message);

    // Handle duplicate email
    if (err.code === '23505') {
      return res.status(409).json({ error: 'This email is already registered.' });
    }

    return res.status(500).json({ error: 'Internal server error. Please try again.' });
  }
});

// ─── GET /students (bonus: view all registrations) ───────────────────────────
app.get('/students', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM students ORDER BY created_at DESC'
    );
    res.json({ count: result.rowCount, students: result.rows });
  } catch (err) {
    console.error('DB Fetch Error:', err.message);
    res.status(500).json({ error: 'Could not fetch students.' });
  }
});

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_, res) => res.json({ status: 'ok', time: new Date() }));

// ─── Start Server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀  Server running at http://localhost:${PORT}`);
});
