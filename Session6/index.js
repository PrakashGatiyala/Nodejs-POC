const express = require('express');
const mongoose = require('mongoose');
const userRouter = require('./routes/user.route');

const app = express();
const port = 3000;

// Middleware to parse JSON data
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://gatiyalap:1ZuTPfvzXdyzhAbZ@cluster0.dbo8sjz.mongodb.net/users?retryWrites=true&w=majority&appName=Cluster0"
  )
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("MongoDB Connection Failed, Error:", err);
    throw err;
  });

// Liveliness test
app.get("/", (req, res)=>{
    res.json({message: "Server is running"});
})

app.use("/users", userRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});



