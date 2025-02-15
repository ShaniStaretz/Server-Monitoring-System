const {
  getExistServerHistory,
  getIsServerHealthy,
} = require("../services/historyService");

// Route handler function
const handleGetExistServerHistory = async (req, res) => {
  const serverId = parseInt(req.params.serverId); // Get the serverId from the URL

  try {
    const history = await getExistServerHistory(serverId);
    console.info(
      `[history] found ${history.length} history records for server with id ${serverId} in the system`
    );
    res.status(200).json(history);
  } catch (error) {
    console.error("[history] Error getExistServerHistory server:", error);
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
      throw { status: 400, message: "Invalid timestamp format." };
    }

    const isHealthy = await getIsServerHealthy(serverId, validTimestamp);
    console.info(
      `[history] found server  ${
        isHealthy ? "was" : "was not"
      } active on time ${timestamp}`
    );
    res.status(200).json(isHealthy);
  } catch (error) {
    console.error(
      "[history] Error handleIsServerHealthyByTimestamp history:",
      error
    );
    res
      .status(error.status || 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

module.exports = {
  handleGetExistServerHistory,
  handleIsServerHealthyByTimestamp,
};
