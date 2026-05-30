const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());

// Serve static files (frontend pages)
app.use(express.static(path.join(__dirname, "public")));

// Path to records file
const recordsFile = path.join(__dirname, "records.json");

// Helper: load records
function loadRecords() {
  try {
    return JSON.parse(fs.readFileSync(recordsFile, "utf8"));
  } catch (err) {
    console.error("Error reading records.json:", err);
    return [];
  }
}

// Helper: save records
function saveRecords(records) {
  fs.writeFileSync(recordsFile, JSON.stringify(records, null, 2));
}

// Route: get all records
app.get("/records", (req, res) => {
  const records = loadRecords();
  res.json(records);
});

// Route: add a record
app.post("/addRecord", (req, res) => {
  const newRecord = req.body;

  // Load existing records
  const records = loadRecords();

  // Append new record
  records.push(newRecord);

  // Save back to file
  saveRecords(records);

  // ✅ Always respond with success JSON
  res.json({ success: true });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
