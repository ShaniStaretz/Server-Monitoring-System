const { executeFunction } = require("../db/db_functions"); // Import the executeFunction from your db_functions.js
const getServersList = async () => {
  const result = await executeFunction(true, "get_all_servers_list");
  if (result.error) {
    throw result.error;
  }
  return result.result.rows;
};

const addNewSerever = async (serverDetails) => {
  const { server_name, port, protocol_name } = serverDetails;

  const protocol_id = await getProtocolIdByName(protocol_name);
  const result = await executeFunction(true, "add_server_to_list", [
    server_name,
    port,
    protocol_id,
  ]);
  if( result.error){
    if(result.error.includes("unique")){
        throw {status:400, message:`the server with name ${server_name} is already exist in the system`}
    }
    throw {status:400, message:result.error}
  }
  if(result.result){
    return  result.result.rows[0].add_server_to_list;
  }
};

const udpateExistSerever = async (serverId,serverDetails) => {
    const { server_name, port, protocol_name } = serverDetails;
  
    const protocol_id = await getProtocolIdByName(protocol_name);
    const result = await executeFunction(true, "update_server", [
        serverId,
        server_name,
      port,
      protocol_id,
    ]);
    if( result.error){
      if(result.error.includes("unique")){
          throw {status:400, message:`the server with name ${server_name} is already exist in the system`}
      }
      throw {status:400, message:result.error}
    }
    if(result.result){
      return  result.result.rows[0].update_server;
    }
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
    console.error("❌ Error fetching protocol id:", error);
    throw new Error("Database query failed");
  }
};

module.exports = { getServersList, addNewSerever,udpateExistSerever };
