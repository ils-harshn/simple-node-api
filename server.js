const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const axios = require("axios");

const app = express();
const Song = require("./models/Song");
const Genre = require("./models/Genre");
const Artist = require("./models/Artist");
const Album = require("./models/Album");
const { load_config, get_config } = require("./config");

app.use(
  cors({
    origin: ["http://localhost:3000", "https://arythmlite.netlify.app"],
    optionsSuccessStatus: 200,
  })
);

app.use(express.json());

// status
app.get("/status", (req, res) => {
  res.json({
    status: "working",
  });
});

// songs
app.get("/songs", async (req, res) => {
  try {
    const {
      original_name,
      album_title,
      album_code,
      genre_name,
      artist_name,
      limit = 10,
      offset = 0,
    } = req.query;

    let filter = {};

    if (original_name) {
      filter.original_name = { $regex: new RegExp(original_name, "i") };
    }

    if (album_title || album_code) {
      const albumFilter = {};
      if (album_title)
        albumFilter.title = { $regex: new RegExp(album_title, "i") };
      if (album_code) albumFilter.code = album_code;

      const albums = await Album.find(albumFilter).select("_id");
      filter.album = { $in: albums.map((album) => album._id) };
    }

    if (genre_name) {
      const genres = await Genre.find({
        name: { $regex: new RegExp(genre_name, "i") },
      }).select("_id");
      filter.genre = { $in: genres.map((genre) => genre._id) };
    }

    if (artist_name) {
      const artists = await Artist.find({
        name: { $regex: new RegExp(artist_name, "i") },
      }).select("_id");
      filter.artists = { $in: artists.map((artist) => artist._id) };
    }

    const songs = await Song.find(filter)
      .populate("album", "code title year thumbnail300x300 thumbnail")
      .populate("genre", "name")
      .populate("artists", "name artists_thumbnail300x300 artists_thumbnail")
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    res.json(songs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/song/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const song = await Song.findById(id)
      .populate("album", "code title year thumbnail300x300 thumbnail")
      .populate("genre", "name")
      .populate("artists", "name artists_thumbnail300x300 artists_thumbnail");

    if (!song) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.json(song);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// artists
app.get("/artists", async (req, res) => {
  try {
    const { name, limit = 10, offset = 0 } = req.query;

    const pipeline = [];

    const matchStage = {};

    if (name) {
      matchStage.name = { $regex: new RegExp(name, "i") };
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push({ $skip: parseInt(offset) }, { $limit: parseInt(limit) });

    const artists = await Artist.aggregate(pipeline);

    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/artist/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const artist = await Artist.findById(id);

    if (!artist) {
      return res.status(404).json({ message: "Artist not found" });
    }

    res.json(artist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// albums
app.get("/albums", async (req, res) => {
  try {
    const { code, title, year, limit = 10, offset = 0 } = req.query;

    const pipeline = [];

    const matchStage = {};

    if (code) {
      matchStage.code = { $regex: new RegExp(code, "i") };
    }

    if (title) {
      matchStage.title = { $regex: new RegExp(title, "i") };
    }

    if (year) {
      matchStage.year = parseInt(year);
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push({ $skip: parseInt(offset) }, { $limit: parseInt(limit) });

    const albums = await Album.aggregate(pipeline);

    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/album/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const album = await Album.findById(id);

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    res.json(album);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// genres
app.get("/genres", async (req, res) => {
  try {
    const { name, limit = 10, offset = 0 } = req.query;

    const pipeline = [];

    const matchStage = {};

    if (name) {
      matchStage.name = { $regex: new RegExp(name, "i") };
    }

    if (Object.keys(matchStage).length > 0) {
      pipeline.push({ $match: matchStage });
    }

    pipeline.push({ $skip: parseInt(offset) }, { $limit: parseInt(limit) });

    const genres = await Genre.aggregate(pipeline);

    res.json(genres);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/genre/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    const genre = await Genre.findById(id);

    if (!genre) {
      return res.status(404).json({ message: "Genre not found" });
    }

    res.json(genre);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// streams
app.get("/stream/image/*", async (req, res) => {
  const imagePath = encodeURIComponent(req.params[0]);

  const allowedPatterns = [
    /^album-images\/(300x300|1200x1200)\/[^/]+$/,
    /^artist-images\/(300x300|1200x1200)\/[^/]+$/,
  ];

  // Check if the imagePath matches any of the allowed patterns
  const isValidPath = allowedPatterns.some((pattern) =>
    pattern.test(req.params[0])
  );

  if (!isValidPath) {
    return res.status(400).send("Invalid image path");
  }

  const url = `${get_config().SRC_URI}/${imagePath}`;

  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    res.setHeader("Content-Type", response.headers["content-type"]);

    response.data.pipe(res);
  } catch (error) {
    console.log(error);
    if (error.response && error.response.status === 404) {
      res.status(404).send("Image not found");
    } else {
      res.status(500).send("Server Error");
    }
  }
});

app.get("/stream/song/*", async (req, res) => {
  const songPath = encodeURIComponent(req.params[0]);

  const allowedPatterns = [/^songs-file\/[^/]+$/];

  // Check if the imagePath matches any of the allowed patterns
  const isValidPath = allowedPatterns.some((pattern) =>
    pattern.test(req.params[0])
  );

  if (!isValidPath) {
    return res.status(400).send("Invalid song file path");
  }

  const url = `${get_config().SRC_URI}/${songPath}`;

  try {
    const range = req.headers.range;
    if (!range) {
      return res.status(416).send("Range header required");
    }

    const headResponse = await axios.head(url);
    const fileSize = headResponse.headers["content-length"];

    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);
    const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

    if (start >= fileSize || end >= fileSize) {
      return res.status(416).send("Requested range not satisfiable");
    }

    const contentLength = end - start + 1;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${fileSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": contentLength,
      "Content-Type": "audio/mpeg",
    });

    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
      headers: {
        Range: `bytes=${start}-${end}`,
      },
    });

    response.data.pipe(res);
  } catch (error) {
    res.status(500).send("Server Error");
  }
});

app.get("/get/lyric/*", async (req, res) => {
  const lrcPath = encodeURIComponent(req.params[0]);

  const allowedPatterns = [/^lrc\/[^/]+$/];

  const isValidPath = allowedPatterns.some((pattern) =>
    pattern.test(req.params[0])
  );

  if (!isValidPath) {
    return res.status(400).send("Invalid lyrics file path");
  }

  const url = `${get_config().SRC_URI}/${lrcPath}`;

  try {
    const response = await axios({
      url,
      method: "GET",
      responseType: "stream",
    });

    res.setHeader("Content-Type", "text/plain");

    response.data.pipe(res);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      res.status(404).send("Lyrics file not found");
    } else {
      res.status(500).send("Server Error");
    }
  }
});

// randoms
app.get("/random-song", async (req, res) => {
  try {
    const { original_name, album_title, album_code, genre_name, artist_name } =
      req.query;

    let filter = {};

    if (original_name) {
      filter.original_name = { $regex: new RegExp(original_name, "i") };
    }

    if (album_title || album_code) {
      const albumFilter = {};
      if (album_title)
        albumFilter.title = { $regex: new RegExp(album_title, "i") };
      if (album_code) albumFilter.code = album_code;

      const albums = await Album.find(albumFilter).select("_id");
      filter.album = { $in: albums.map((album) => album._id) };
    }

    if (genre_name) {
      const genres = await Genre.find({
        name: { $regex: new RegExp(genre_name, "i") },
      }).select("_id");
      filter.genre = { $in: genres.map((genre) => genre._id) };
    }

    if (artist_name) {
      const artists = await Artist.find({
        name: { $regex: new RegExp(artist_name, "i") },
      }).select("_id");
      filter.artists = { $in: artists.map((artist) => artist._id) };
    }

    const randomSong = await Song.aggregate([
      { $match: filter },
      { $sample: { size: 1 } },
      {
        $lookup: {
          from: "albums",
          localField: "album",
          foreignField: "_id",
          as: "album",
        },
      },
      { $unwind: "$album" },
      {
        $lookup: {
          from: "genres",
          localField: "genre",
          foreignField: "_id",
          as: "genre",
        },
      },
      { $unwind: "$genre" },
      {
        $lookup: {
          from: "artists",
          localField: "artists",
          foreignField: "_id",
          as: "artists",
        },
      },
      {
        $project: {
          _id: 1,
          original_name: 1,
          title: 1,
          url: 1,
          original_name: 1,
          "album._id": 1,
          "album.code": 1,
          "album.title": 1,
          "album.year": 1,
          "album.thumbnail300x300": 1,
          "album.thumbnail": 1,
          "genre._id": 1,
          "genre.name": 1,
          "artists._id": 1,
          "artists.name": 1,
          "artists.artists_thumbnail300x300": 1,
          "artists.artists_thumbnail": 1,
          lyrics: 1,
        },
      },
    ]);

    if (randomSong.length === 0) {
      return res
        .status(404)
        .json({ message: "No songs found matching the criteria" });
    }

    res.json(randomSong[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const main = async () => {
  await load_config();

  mongoose
    .connect(get_config().MONGO_URI)
    .then(() => {
      console.log("Connected to MongoDB");
    })
    .catch((err) => {
      console.error("Connection error:", err.message);
      process.exit(1);
    });

  app.listen(3000, () => {
    console.log("Server is running on port 3000");
  });
};

main();
