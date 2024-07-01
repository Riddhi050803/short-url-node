const express = require("express");
const router = express.Router();
const URL = require("../models/url"); // Import the URL model

router.get('/', async (req, res) => {
  if(!req.user) return res.redirect('./login');
  try {
    const allUrls = await URL.find({ createdBy: req.user._id});
    return res.render('home', {
      urls: allUrls
    });
  } catch (error) {
    console.error("Failed to retrieve URLs", error);
    return res.status(500).json({ error: "Failed to retrieve URLs" });
  }
});

router.get("/signup",(req,res)=>{
 return res.render("signup");
});
router.get("/login",(req,res)=>{
  return res.render("login");
 });

module.exports = router;
