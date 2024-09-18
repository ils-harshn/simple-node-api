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
    CONFIG = JSON.parse(payload);
  } catch {
    CONFIG = process.env;
  }
};

module.exports = { CONFIG, load_config };
