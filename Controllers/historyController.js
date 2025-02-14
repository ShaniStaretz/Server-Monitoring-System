const {
  getExistServerHistory,
  getIsServerHealthy,
} = require("../services/historyService");
// Route handler function
const handleGetExistServerHistory = async (req, res) => {
  const serverId = parseInt(req.params.serverId); // Get the serverId from the URL

  try {
    // Call the getExistServerHistory function with the data
    const history = await getExistServerHistory(serverId);
    console.log(
      `found ${history.length} history records for server with id ${serverId} in the system`
    );
    // Respond with success message
    res.status(200).json(history);
  } catch (error) {
    console.error("❌ Error getExistServerHistory server:", error);
    res
      .status(error.status ? error.status : 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const handleIsServerHealthyByTimestamp = async (req, res) => {
  const serverId = parseInt(req.params.serverId); // Get the serverId from the URL
  const timestamp = req.query.timestamp;
  try {
    // Make sure the timestamp is a valid Date object or in ISO 8601 string format
    const validTimestamp = new Date(timestamp); // Convert string to Date if it's not already

    // If timestamp is invalid, throw an error
    if (isNaN(validTimestamp.getTime())) {
      throw new Error("Invalid timestamp format.");
    }
    // Call the getExistServerHistory function with the data
    const isHealthy = await getIsServerHealthy(serverId, validTimestamp);

    // Respond with success message
    res.status(200).json(isHealthy);
  } catch (error) {
    console.error("❌ Error handleIsServerHealthyByTimestamp history:", error);
    res
      .status(error.status ? error.status : 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

module.exports = {
  handleGetExistServerHistory,
  handleIsServerHealthyByTimestamp,
};
