const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const cors = require("cors");
const app = express();
const PORT = 3000;
const fs = require("fs-extra");
const auditsFile = "./data/audits.json";

app.use(cors());
app.use(express.static("public"));

app.get("/analyze", async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const pageRes = await axios.get(url);
    const $ = cheerio.load(pageRes.data);

    const title = $("title").text();
    const metaDescription = $("meta[name='description']").attr("content") || "Not Found";
    const h1Tags = $("h1").length;
    const canonical = $("link[rel='canonical']").attr("href") || "Not Found";
    const robotsMeta = $("meta[name='robots']").attr("content") || "Not Found";
    const images = $("img");
    const imagesWithAlt = images.filter((i, el) => $(el).attr("alt")).length;
    const imageAltRatio = images.length ? ((imagesWithAlt / images.length) * 100).toFixed(2) : 0;

    const { hostname, protocol } = new URL(url);
    const base = `${protocol}//${hostname}`;

    let robotsTxt = "Not Found";
    try 
    {
      const robotsRes = await axios.get(`${base}/robots.txt`);
      robotsTxt = robotsRes.data || "Empty";
    } 
    catch (err) 
    {
      robotsTxt = "Not Found";
    }

    const hasSitemap = /sitemap\.xml/i.test(robotsTxt) ? "Yes" : "Not Found";

    res.json({
      title,
      metaDescription,
      h1Tags,
      canonical,
      robotsMeta,
      imageAltRatio,
      totalImages: images.length,
      imagesWithAlt,
      robotsTxt,
      hasSitemap,
    });
  } 
  catch (err) 
  {
    console.error(err.message);
    res.status(500).json({ error: "Failed to fetch and analyze page." });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));

app.post("/save-audit", async (req, res) => {
  const { email, reportHtml, score } = req.body;
  if (!email || !reportHtml) return res.status(400).json({ error: "Missing fields" });

  try 
  {
    const audits = await fs.readJson(auditsFile).catch(() => []);
    audits.push({
      email,
      score,
      date: new Date().toISOString(),
      reportHtml
    });
    await fs.writeJson(auditsFile, audits, { spaces: 2 });
    res.json({ success: true });
  } 
  catch (err) 
  {
    console.error(err);
    res.status(500).json({ error: "Failed to save audit" });
  }
});

app.get("/get-audits", async (req, res) => {
  const { email } = req.query;
  try 
  {
    const audits = await fs.readJson(auditsFile).catch(() => []);
    const filtered = email ? audits.filter(a => a.email === email) : audits;
    res.json(filtered.reverse());
  } 
  catch (err) 
  {
    res.status(500).json({ error: "Failed to load audits" });
  }
});

