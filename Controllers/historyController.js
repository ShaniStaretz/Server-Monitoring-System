const {
  getExistServerHistory,
  getIsServerHealthy,
} = require("../services/historyService");

// Route handler function
const handleGetExistServerHistory = async (req, res) => {
  const serverId = parseInt(req.params.serverId); // Get the serverId from the URL

  try {
    if (!serverId) {
      throw { status: 400, message: "invalid input, missing serverId" };
    }
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
    if (!serverId) {
      throw { status: 400, message: "invalid input, missing serverId" };
    }
    if (!timestamp || !isValidDateTime(timestamp)) {
      throw {
        status: 400,
        message:
          "invalid input,timestamp must be in format YYYY-MM-DD HH:MM:SS",
      };
    }
    const validTimestamp = new Date(timestamp);
    const isHealthy = await getIsServerHealthy(serverId, validTimestamp);
    console.info(
      `[history] found server ${
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
const isValidDateTime = (timestamp) => {
  const regex =
    /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01]) ([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  return regex.test(timestamp);
};

module.exports = {
  handleGetExistServerHistory,
  handleIsServerHealthyByTimestamp,
};
