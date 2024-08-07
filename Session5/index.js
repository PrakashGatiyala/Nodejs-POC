const express = require("express");
const mongoose = require("mongoose");
const blogRounter = require("./routes/blog.route");

mongoose
  .connect(
    "mongodb+srv://gatiyalap:<PASSWORD>@cluster0.dbo8sjz.mongodb.net/blogapplication?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("MongoDB Connection Failed, Error:", err);
    throw err;
  });

const app = express();
const PORT = 8000;

// Middleware
app.use(express.json());

// Liveliness test
app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

app.use("/blogs", blogRounter);

// Config
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
