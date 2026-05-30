const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// Middleware
app.use(express.json());

// Clock-in/out route (already working)
app.post("/addRecord", (req, res) => {
  const filePath = path.join(__dirname, "records.json");
  const newRecord = req.body;

  fs.readFile(filePath, "utf8", (err, data) => {
    let records = [];
    if (!err && data) {
      try {
        records = JSON.parse(data);
      } catch (parseErr) {
        console.error("Invalid JSON, starting fresh:", parseErr);
      }
    }
    records.push(newRecord);

    fs.writeFile(filePath, JSON.stringify(records, null, 2), (writeErr) => {
      if (writeErr) {
        console.error("Error writing records:", writeErr);
        return res.status(500).json({ success: false });
      }
      res.json({ success: true });
    });
  });
});

// Records route
app.get("/records", (req, res) => {
  const filePath = path.join(__dirname, "records.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading records.json:", err);
      return res.status(500).json({ error: "Failed to read records file" });
    }
    try {
      const json = JSON.parse(data);
      res.json(json);
    } catch (parseErr) {
      console.error("Invalid JSON in records.json:", parseErr);
      res.status(500).json({ error: "Invalid JSON format" });
    }
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
