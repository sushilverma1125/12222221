import express from "express";
import { nanoid } from "nanoid";
import { logBackend } from "./logger";

const app = express();
app.use(express.json());

interface UrlRecord {
  originalUrl: string;
  shortcode: string;
  expiry: Date;
  createdAt: Date;
  clicks: ClickRecord[];
}

interface ClickRecord {
  timestamp: Date;
  referrer: string | null;
  location: string; // simplified for demo
}

const PORT = 4000;
const BASE_URL = `http://localhost:${PORT}`;

const urlDB = new Map<string, UrlRecord>();

// Helper validation functions
function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function isValidShortcode(code: string): boolean {
  return /^[a-zA-Z0-9_-]{4,20}$/.test(code);
}

// Create Short URL
app.post("/shorturls", async (req, res) => {
  const { url, validity, shortcode } = req.body;

  await logBackend("info", "handler", `Received request to shorten URL: ${url}`);

  if (!url || typeof url !== "string" || !isValidUrl(url)) {
    await logBackend("warn", "handler", `Invalid URL provided: ${url}`);
    return res.status(400).json({ error: "Invalid URL format" });
  }

  let validityMinutes = 30;
  if (validity !== undefined) {
    if (typeof validity !== "number" || validity <= 0) {
      await logBackend("warn", "handler", `Invalid validity period: ${validity}`);
      return res.status(400).json({ error: "Validity must be a positive integer" });
    }
    validityMinutes = validity;
  }

  let code = "";
  if (shortcode !== undefined) {
    if (typeof shortcode !== "string" || !isValidShortcode(shortcode)) {
      await logBackend("warn", "handler", `Invalid shortcode format: ${shortcode}`);
      return res.status(400).json({ error: "Invalid shortcode format. Alphanumeric, 4-20 chars." });
    }
    if (urlDB.has(shortcode)) {
      await logBackend("warn", "handler", `Shortcode collision for: ${shortcode}`);
      return res.status(409).json({ error: "Shortcode already in use" });
    }
    code = shortcode;
  } else {
    // Generate unique shortcode
    do {
      code = nanoid(7);
    } while (urlDB.has(code));
  }

  const now = new Date();
  const expiry = new Date(now.getTime() + validityMinutes * 60 * 1000);

  const newRecord: UrlRecord = {
    originalUrl: url,
    shortcode: code,
    expiry,
    createdAt: now,
    clicks: [],
  };

  urlDB.set(code, newRecord);

  await logBackend("info", "service", `Created new short URL with shortcode: ${code}`);

  return res.status(201).json({
    shortLink: `${BASE_URL}/${code}`,
    expiry: expiry.toISOString(),
  });
});

// Redirect to original URL
app.get("/:shortcode", async (req, res) => {
  const code = req.params.shortcode;

  await logBackend("info", "handler", `Redirect request for shortcode: ${code}`);

  const record = urlDB.get(code);
  if (!record) {
    await logBackend("warn", "handler", `Shortcode not found: ${code}`);
    return res.status(404).json({ error: "Shortcode not found" });
  }

  if (record.expiry < new Date()) {
    await logBackend("warn", "handler", `Shortcode expired: ${code}`);
    return res.status(410).json({ error: "Shortcode expired" });
  }

  // Log click
  const click: ClickRecord = {
    timestamp: new Date(),
    referrer: req.get("referer") || null,
    location: req.ip || "unknown",
  };
  record.clicks.push(click);

  await logBackend("info", "service", `Redirecting shortcode ${code} to ${record.originalUrl}`);

  return res.redirect(record.originalUrl);
});

// Get stats for shortcode
app.get("/shorturls/:shortcode", async (req, res) => {
  const code = req.params.shortcode;

  await logBackend("info", "handler", `Stats request for shortcode: ${code}`);

  const record = urlDB.get(code);
  if (!record) {
    await logBackend("warn", "handler", `Shortcode not found (stats): ${code}`);
    return res.status(404).json({ error: "Shortcode not found" });
  }

  return res.json({
    originalUrl: record.originalUrl,
    createdAt: record.createdAt.toISOString(),
    expiry: record.expiry.toISOString(),
    totalClicks: record.clicks.length,
    clicks: record.clicks.map(c => ({
      timestamp: c.timestamp.toISOString(),
      referrer: c.referrer,
      location: c.location,
    })),
  });
});

app.listen(PORT, () => {
  console.log(`Backend running at http://localhost:${PORT}`);
});
