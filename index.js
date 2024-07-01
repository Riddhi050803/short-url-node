const express = require("express");
const { connectToMongoDB } = require("./connect");
const cookieParser = require('cookie-parser');
const URL = require("./models/url");
const {restrictToLoggedinUserOnly ,checkAuth}= require('./middlewares/auth');
const  path = require('path');

const urlRoute = require("./routes/url");
const staticRoute = require("./routes/staticRouter");
const userRoute = require('./routes/user');

const app = express();
const PORT = 8001;

connectToMongoDB("mongodb://localhost:27017/short-url")
  .then(() => console.log("MongoDB connected"))
  .catch((error) => {
    console.error("Failed to connect to MongoDB", error);
    process.exit(1);
  });

app.set("view engine", "ejs");
app.set('views',path.resolve("./views"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());



app.use("/url",restrictToLoggedinUserOnly, urlRoute);
app.use("/user", userRoute);
app.use("/",checkAuth,staticRoute);

// app.get("/test",async(req,res)=>{
//   const allUrls = await URL.find({});
//   return res.render('home',{
//     urls:allUrls,
//   });
// });
app.get("/:shortId", async (req, res) => {
  const shortId = req.params.shortId;

  try {
    const entry = await URL.findOneAndUpdate(
      { shortId },
      {
        $push: {
          visitHistory: {
            timestamp: Date.now(),
          },
        },
      },
      { new: true }
    );

    if (!entry) {
      return res.status(404).json({ error: "Short URL not found" });
    }

    res.redirect(entry.redirectURL);
  } catch (error) {
    console.error("Failed to handle redirect", error);  // Log the error for debugging
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => console.log(`Server started at PORT: ${PORT}`));
