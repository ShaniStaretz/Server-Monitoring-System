const { executeFunction } = require("../db/db_functions"); // Import the executeFunction from your db_functions.js
const getExistServerHistory = async (serverId) => {
  const response = await executeFunction(true, "get_monitor_history_by_server", [
    serverId,
  ]);
  if (response.error) {
    if ((response.error.code = "P0002")) {
      throw { status: 404, message: response.error.message };
    }
    throw { status: 500, message: response.error.message };
  }

  return response.result.rows;
};

const getIsServerHealthy = async (serverId, timestamp) => {
  //if the is not record with this timestamp return false
  const response = await executeFunction(true, "is_server_healthy", [
    serverId,
    timestamp,
  ]);
  if (response.error) {
    if ((response.error.code = "P0002")) {
      throw { status: 404, message: response.error.message };
    }
    throw { status: 500, message: response.error.message };
  }

  return response.result.rows[0];
};

const addMonitoryLogByServerId = async (serverId, status) => {
  let params = [serverId];
  if (status) {
    params.push(status);
  }
  await executeFunction(false, "add_monitor_log_to_history", params);
};

module.exports = {
  getExistServerHistory,
  getIsServerHealthy,
  addMonitoryLogByServerId,
};
