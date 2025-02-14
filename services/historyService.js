const { executeFunction } = require("../db/db_functions"); // Import the executeFunction from your db_functions.js
const getExistServerHistory = async (serverId) => {
  const result = await executeFunction(true, "get_monitor_history_by_server", [
    serverId,
  ]);
  if (result.error) {
    if ((result.error.code = "P0002")) {
      throw { status: 404, message: result.error.message };
    }
    throw { status: 500, message: result.error.message };
  }

  return result.result.rows;
};

const getIsServerHealthy = async (serverId, timestamp) => {
  //if the is not record with this timestamp return false
  const result = await executeFunction(true, "is_server_healthy", [
    serverId,
    timestamp,
  ]);
  if (result.error) {
    if ((result.error.code = "P0002")) {
      throw { status: 404, message: result.error.message };
    }
    throw { status: 500, message: result.error.message };
  }

  return result.result.rows[0];
};

module.exports = { getExistServerHistory, getIsServerHealthy };
