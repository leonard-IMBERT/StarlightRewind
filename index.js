const express = require("express");
const path = require("path");

const app = express();

const STARLIGHT_REWIND_PORT = process.env.STARLIGHT_REWIND_PORT || 3000;
const STARLIGHT_REWIND_PREFIX = process.env.STARLIGHT_REWIND_PREFIX || "";

app.use(`${STARLIGHT_REWIND_PREFIX}/ressources`, express.static("ressources"));
app.use(`${STARLIGHT_REWIND_PREFIX}/scripts`, express.static("src"));

app.get(`${STARLIGHT_REWIND_PREFIX}`, (_, res) => {
  res.redirect(`${STARLIGHT_REWIND_PREFIX}/play`);
});
app.get(`${STARLIGHT_REWIND_PREFIX}/play`, (_, res) => {
  res.sendFile(path.join(__dirname, "ressources/movie.html"));
})

app.listen(STARLIGHT_REWIND_PORT, () => {
  console.log(`Listening on ${STARLIGHT_REWIND_PORT}`);
});
