const { executeFunction } = require("../db/db_functions");
const { encryptPassword, decryptPassword } = require("../utils/encryptions");

const getServersList = async () => {
  const result = await executeFunction(true, "get_all_servers_list");

  if (result.error) {
    throw result.error;
  }
  const servers = result.result.rows;
  for (const server of servers) {
    if (server.password) {
      server.password = decryptPassword(server.password);
    }
  }
  return servers;
};

const addNewSerever = async (serverDetails) => {
  const { server_name, port, protocol_name, username, password } =
    serverDetails;
  let result;
  const protocol_id = await getProtocolIdByName(protocol_name);
  if (password) {
    const encryptedPassword = encryptPassword(password);
    result = await executeFunction(true, "add_server_to_list", [
      server_name,
      port,
      protocol_id,
      username,
      encryptedPassword,
    ]);
  }
  result = await executeFunction(true, "add_server_to_list", [
    server_name,
    port,
    protocol_id,
  ]);
  if (result.error) {
    if (result.error.code == "23505") {
      throw {
        status: 400,
        message: `the server with name ${server_name} is already exist in the system`,
      };
    }
    throw { status: 400, message: result.error };
  }
  if (result.result) {
    return result.result.rows[0].add_server_to_list;
  }
};

const udpateExistSerever = async (serverId, serverDetails) => {
  const { server_name, server_url = null, port, protocol_name } = serverDetails;

  let response;
  let values = [serverId, server_name, server_url, port];
  if (protocol_name) {
    const protocol_id = await getProtocolIdByName(protocol_name);
    values.push(protocol_id);
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
  const result = await executeFunction(false, "delete_server_by_id", [
    serverId,
  ]);
  if (result.error) {
    if ((result.error.code = "P0002")) {
      throw { status: 404, message: result.error.message };
    }
    throw { status: 500, message: result.error.message };
  }
};

const getExistSerever = async (serverId) => {
  const result = await executeFunction(true, "get_server_by_id", [serverId]);
  if (result.error) {
    if ((result.error.code = "P0002")) {
      throw { status: 404, message: result.error.message };
    }
    throw { status: 500, message: result.error.message };
  }
  let server = result.result.rows[0];
  server.password = decryptPassword(server.password);
  return server;
};

const getProtocolIdByName = async (protocolName) => {
  try {
    const result = await executeFunction(true, "get_protocol_id_by_name", [
      protocolName,
    ]);
    if (result.result) {
      return result.result.rows[0].result;
    } else {
      throw result.error; // No protocol found
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
