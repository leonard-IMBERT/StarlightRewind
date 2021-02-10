const express = require("express");
const path = require("path");

const app = express();

app.use("/ressources", express.static("ressources"));
app.use("/scripts", express.static("src"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "ressources/movie.html"));
})

app.listen(3000, () => {
  console.log("Listening on 3000");
});
