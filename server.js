const http = require("http");
const express = require("express");
const cors = require("cors");
const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.get("/status", (req, res) => {
  res.json({
    status: "working",
    app_name: process.env.APP_NAME,
  });
});

server.listen(3000, () => {
  console.log(`server is running at 3000`);
});
