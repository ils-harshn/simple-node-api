const http = require("http");
const express = require("express");
const cors = require("cors");
const { load_config, get_config } = require("./config");
const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.get("/status", (req, res) => {
  console.log("STATUS LOG FOR CONGIF", get_config());

  res.json({
    status: "working",
    app_name: get_config().APP_NAME,
  });
});

const main = async () => {
  await load_config();

  server.listen(3000, () => {
    console.log(`server is running at 3000`);
  });
};

main();
