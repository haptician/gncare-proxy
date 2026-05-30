const fs = require("fs");
const path = require("path");

app.get("/records", (req, res) => {
  const filePath = path.join(__dirname, "records.json");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading records.json:", err);
      return res.status(500).json({ error: "Failed to read records file" });
    }
    res.setHeader("Content-Type", "application/json");
    res.send(data);
  });
});

const express = require("express");
const cors = require("cors");

const app = express();

// Allow requests from your GitHub Pages domain
app.use(cors({
  origin: "https://haptician.github.io"
}));

app.use(express.json());

const fetch = require("node-fetch");
const bodyParser = require("body-parser");

app.use(bodyParser.json());

const GITHUB_USER = "haptician";
const GITHUB_REPO = "gncare";
const FILE_PATH = "records.json";
const TOKEN = process.env.GITHUB_TOKEN; // store securely

app.post("/addRecord", async (req, res) => {
  const newRecord = req.body;

  try {
    const resGet = await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      headers: { Authorization: `token ${TOKEN}` }
    });
    const data = await resGet.json();
    const sha = data.sha;
    const records = JSON.parse(Buffer.from(data.content, "base64").toString("utf8"));

    records.push(newRecord);

    const updatedContent = Buffer.from(JSON.stringify(records, null, 2)).toString("base64");

    await fetch(`https://api.github.com/repos/${GITHUB_USER}/${GITHUB_REPO}/contents/${FILE_PATH}`, {
      method: "PUT",
      headers: {
        Authorization: `token ${TOKEN}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Add ${newRecord.type} record`,
        content: updatedContent,
        sha
      })
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update GitHub file" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));

app.get("/", (req, res) => {
  res.send("Proxy is running!");
});
