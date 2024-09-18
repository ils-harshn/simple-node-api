const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const songSchema = new Schema({
  title: { type: String, required: true },
  url: { type: String, required: true },
  original_name: { type: String, required: true },
  album: { type: Schema.Types.ObjectId, ref: "Album", required: true },
  genre: { type: Schema.Types.ObjectId, ref: "Genre", required: true },
  artists: [{ type: Schema.Types.ObjectId, ref: "Artist" }],
  lyrics: { type: String, required: false },
});

const Song = mongoose.model("Song", songSchema);

module.exports = Song;
