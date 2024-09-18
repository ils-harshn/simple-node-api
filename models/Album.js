const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const albumSchema = new Schema({
  code: { type: String, required: true },
  title: { type: String, required: true },
  year: { type: Number, required: true },
  thumbnail300x300: { type: String, required: false },
  thumbnail: { type: String, required: false },
});

const Album = mongoose.model("Album", albumSchema);

module.exports = Album;
