require("dotenv").config();
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const client = new SecretManagerServiceClient();

let CONFIG = process.env;

exports.load_config = async () => {
  try {
    console.log(
      "process.env.SECRET_VERSION_NAME:",
      process.env.SECRET_VERSION_NAME
    );

    const [version] = await client.accessSecretVersion({
      name: process.env.SECRET_VERSION_NAME,
    });

    console.log("TAKING GCP SECRET RESOURCE", version.payload.data);
    const payload = version.payload.data.toString("utf8");
    CONFIG = JSON.parse(payload);
    console.log("CONFIG", CONFIG);
  } catch (error) {
    console.error("Error accessing secret version:", error);
    console.log("TAKING LOCAL RESOURCE");
    CONFIG = process.env;
  }
};

exports.get_config = () => CONFIG;

// module.exports = { CONFIG, load_config };
