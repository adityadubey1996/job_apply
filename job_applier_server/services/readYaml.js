const { Storage } = require("@google-cloud/storage");
const yaml = require("js-yaml");

const axios = require("axios");

async function readYAML(yamlFilePath) {
  const storage = new Storage();
  try {
    const response = await axios.get(yamlFilePath);

    if (response.status !== 200) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    console.log("YAML file content fetched successfully.");
    const yamlData = yaml.load(response.data);
    console.log("Parsed YAML data:", yamlData);

    return yamlData;
  } catch (error) {
    console.error(
      `Error fetching YAML file from signed URL: ${yamlFilePath}`,
      error
    );
    throw new Error("Failed to fetch YAML file from signed URL.");
  }
}

module.exports = { readYAML };
