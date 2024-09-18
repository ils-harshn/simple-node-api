require("dotenv").config();
const { SecretManagerServiceClient } = require("@google-cloud/secret-manager");

const client = new SecretManagerServiceClient();

let CONFIG = process.env;

const load_config = async () => {
  try {
    const [version] = await client.accessSecretVersion({
      name: process.env.SECRET_VERSION_NAME,
    });

    const payload = version.payload.data.toString("utf8");
    console.log("TAKING GCP SECRET RESOURCE", version.payload.data);
    CONFIG = JSON.parse(payload);
  } catch {
    console.log("TAKING LOCAL RESOURCE")
    CONFIG = process.env;
  }
};

module.exports = { CONFIG, load_config };
