const express = require("express");
const path = require("path");

const app = express();

const STARLIGHT_REWIND_PORT = process.env.STARLIGHT_REWIND_PORT || 3000;

app.use("/ressources", express.static("ressources"));
app.use("/scripts", express.static("src"));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "ressources/movie.html"));
})

app.listen(STARLIGHT_REWIND_PORT, () => {
  console.log(`Listening on ${STARLIGHT_REWIND_PORT});
});
