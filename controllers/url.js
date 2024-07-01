const { v4: uuidv4 } = require('uuid');
const URL = require("../models/url");

async function handleGenerateNewShortURL(req, res) {
  const body = req.body;
  if (!body.url) {
    return res.status(400).json({ error: "url is required" });
  }
  const shortID = uuidv4().slice(0, 10);  // Generate a short ID by truncating the UUID

  try {
    await URL.create({
      shortId: shortID,
      redirectURL: body.url,
      visitHistory: [],
      createdBy: req.user._id,
    });
    return res.render('home',{
      id: shortID,
    })
    return res.json({ id: shortID });
  } catch (error) {
    console.error("Failed to create short URL", error);  // Log the error for debugging
    return res.status(500).json({ error: "Failed to create short URL" });
  }
}

async function handleGetAnalytics(req, res) {
  const shortId = req.params.shortId;

  try {
    const result = await URL.findOne({ shortId });
    if (!result) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    return res.json({
      totalClicks: result.visitHistory.length,
      analytics: result.visitHistory,
    });
  } catch (error) {
    console.error("Failed to retrieve analytics", error);  // Log the error for debugging
    return res.status(500).json({ error: "Failed to retrieve analytics" });
  }
}

module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
};
