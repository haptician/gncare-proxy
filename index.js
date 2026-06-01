const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files (frontend pages)
app.use(express.static(path.join(__dirname, "public")));

// Connect to Supabase Postgres using DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// Route: get all records
app.get("/records", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM records ORDER BY record_time DESC");
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching records:", err);
    res.status(500).json({ error: "Error fetching records" });
  }
});

// Add a record
app.post("/addRecord", async (req, res) => {
  const { action, record_time, latitude, longitude } = req.body;
  try {
    await pool.query(
      "INSERT INTO records (action, record_time, latitude, longitude) VALUES ($1, $2, $3, $4)",
      [action, record_time, latitude, longitude]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error adding record:", err.message);
    res.status(500).json({ error: err.message });
  }
});
//
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Add these new routes below your existing ones

// Clock-in endpoint (automated)
app.post("/clock-in", async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    await pool.query(
      "INSERT INTO records (action, record_time, latitude, longitude) VALUES ($1, NOW(), $2, $3)",
      ["clock-in", latitude, longitude]
    );
    res.json({ success: true, action: "clock-in" });
  } catch (err) {
    console.error("Error clocking in:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Clock-out endpoint (automated)
app.post("/clock-out", async (req, res) => {
  const { latitude, longitude } = req.body;
  try {
    await pool.query(
      "INSERT INTO records (action, record_time, latitude, longitude) VALUES ($1, NOW(), $2, $3)",
      ["clock-out", latitude, longitude]
    );
    res.json({ success: true, action: "clock-out" });
  } catch (err) {
    console.error("Error clocking out:", err.message);
    res.status(500).json({ error: err.message });
  }
});
