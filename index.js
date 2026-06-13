const express = require("express");
const path = require("path");
const { Pool } = require("pg");

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URL || !process.env.SUPABASE_USER_ID) {
  console.error("Missing required environment variables");
  process.exit(1);
}

const MY_USER_ID = process.env.SUPABASE_USER_ID;

const VALID_ACTIONS = ["clock-in", "clock-out"];

const default_latitude =37.502750
const default_longitude = 127.059750;

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
	  const result = await pool.query(
  "SELECT * FROM records WHERE user_id = $1 ORDER BY record_time DESC",
  [MY_USER_ID]
);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching records:", err);
    res.status(500).json({ error: "Error fetching records" });
  }
});

app.get("/currentStatus", async (req, res) => {
  try {
    const result = await pool.query(
  "SELECT action FROM records WHERE user_id = $1 ORDER BY record_time DESC LIMIT 1",
  [MY_USER_ID]
);

    if (result.rows.length === 0) {
      return res.json({ status: "clocked-out" });
    }

    const lastAction = result.rows[0].action;
    res.json({ status: lastAction === "clock-in" ? "clocked-in" : "clocked-out" });
  } catch (err) {
    console.error("Error fetching current status:", err);
    res.status(500).json({ status: "unknown" });
  }
});

// Add a record
app.post("/addRecord", async (req, res) => {
	let { action, record_time, latitude, longitude } = req.body;

  if (!action) {
    return res.status(400).json({ error: "action is required" });
  }
if (!VALID_ACTIONS.includes(action)) {
  return res.status(400).json({ error: "Invalid action" });
}

	if (!record_time) {
		record_time = new Date().toISOString(); // safer format for SQL timestamp
	}

if (record_time) {
  const parsed = new Date(record_time);
  if (isNaN(parsed.getTime())) {
    return res.status(400).json({ error: "Invalid record_time" });
  }
  record_time = parsed.toISOString();
}

if (latitude == null)  { latitude = default_latitude; }
if (longitude == null) { longitude = default_longitude; }

  try {
    await pool.query(
	    "INSERT INTO records (user_id, action, record_time, latitude, longitude) VALUES ($1, $2, $3, $4, $5)",
	    [MY_USER_ID, action, record_time, latitude, longitude]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("Error adding record:", err.message);
    res.status(500).json({ error: "Error adding record" });
  }
});


// 404 Handler
app.use((req, res) => res.status(404).json({ error: "Not found" }))

//
// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
