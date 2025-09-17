// simple express server with a fun route
const express = require("express");
const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("Hello+ World! 🚀");
});

app.get("/random", (req, res) => {
  const number = Math.floor(Math.random() * 100) + 1;
  res.send(`Here’s a random number for you: ${number}`);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
