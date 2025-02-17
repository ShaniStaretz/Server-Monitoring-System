const { executeFunction } = require("../db/db_functions");
const { encryptPassword, decryptPassword } = require("../utils/encryptions");

const getServersList = async () => {
  const response = await executeFunction(true, "get_all_servers_list");

  if (response.error) {
    throw response.error;
  }
  const servers = response.result.rows;
  for (const server of servers) {
    if (server.password) {
      server.password = decryptPassword(server.password);
    }
  }
  return servers;
};

const addNewSerever = async (serverDetails) => {
  const { server_url, server_name, username, password } = serverDetails;
  let values = [server_name.trim(), server_url.trim()];
  if (password) {
    const encryptedPassword = encryptPassword(password.trim());
    values.push(username);
    values.push(encryptedPassword);
  }
  const response = await executeFunction(true, "add_server_to_list", values);
  if (response.error) {
    if (response.error.code == "23505") {
      throw {
        status: 400,
        message: `the server with name ${server_name} is already exist in the system`,
      };
    }
    throw { status: 400, message: response.error };
  }
  if (response.result) {
    return response.result.rows[0].add_server_to_list;
  }
};

const udpateExistSerever = async (serverId, serverDetails) => {
  const { server_url, server_name, username, password } = serverDetails;

  let response;
  let values = [serverId,server_url, server_name];
 
  if (password) {
    const encryptedPassword = encryptPassword(password);
    values.push(username);
    values.push(encryptedPassword);
  }

  response = await executeFunction(true, "update_server", values);

  if (response.error) {
    if ((response.error.code = "23505")) {
      //UNIQUE constraint
      throw {
        status: 400,
        message: `The server doesn't exist in the system`,
      };
    } else if ((response.error.code = "P0002")) {
      //not exist
      throw { status: 404, message: response.error };
    }
  }
  if (response.result) {
    return response.result.rows[0].update_server;
  }
};

const deleteExistSerever = async (serverId) => {
  const response = await executeFunction(false, "delete_server_by_id", [
    serverId,
  ]);
  if (response.error) {
    if ((response.error.code = "P0002")) {
      throw { status: 404, message: response.error.message };
    }
    throw { status: 500, message: response.error.message };
  }
};

const getExistSerever = async (serverId) => {
  const response = await executeFunction(true, "get_server_by_id", [serverId]);
  if (response.error) {
    if ((response.error.code = "P0002")) {
      throw { status: 404, message: response.error.message };
    }
    throw { status: 500, message: response.error.message };
  }
  let server = response.result.rows[0];
  if (server.password) {
    server.password = decryptPassword(server.password);
  }
  return server;
};

const getProtocolIdByName = async (protocolName) => {
  try {
    const response = await executeFunction(true, "get_protocol_id_by_name", [
      protocolName,
    ]);
    if (response.result) {
      return response.result.rows[0].result;
    } else {
      throw response.error; // No protocol found
    }
  } catch (error) {
    console.error("Error fetching protocol id:", error);
    throw new Error("Database query failed");
  }
};

module.exports = {
  getServersList,
  addNewSerever,
  udpateExistSerever,
  deleteExistSerever,
  getExistSerever,
};
