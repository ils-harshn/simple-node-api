const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const artistSchema = new Schema({
  name: { type: String, required: true },
  artists_thumbnail: { type: String, required: false },
  artists_thumbnail300x300: { type: String, required: false },
});

const Artist = mongoose.model("Artist", artistSchema);

module.exports = Artist;
