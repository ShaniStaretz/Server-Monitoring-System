const {
  getServersList,
  addNewSerever,
  udpateExistSerever,
  deleteExistSerever,
} = require("../services/serversService");

// Route handler function
const handleGetServersList = async (req, res) => {
  try {
    const servers = await getServersList();
    console.log(`found ${servers.length} servers in the system`);
    res.status(200).json(servers);
  } catch (error) {
    res
      .status(error.status ? error.status : 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

// Route handler function
const handlePostAddNewServer = async (req, res) => {
  try {
    const server_id = await addNewSerever(req.body);
    console.log(`added new server to the system with id: ${server_id}`);
    res.status(200).json({ message: "the server was added succefully" });
  } catch (error) {
    res
      .status(error.status ? error.status : 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

// Route handler function
const handlePutUpdateExistServer = async (req, res) => {
  const serverId = parseInt(req.params.serverId); // Get the serverId from the URL
  // const { currentStatus, serverName, port, protocol_name } = req.body;  // Get other parameters from the request body

  try {
    // Call the updateServer function with the data
    const returned_server = await udpateExistSerever(serverId, req.body);

    // Respond with success message
    res
      .status(200)
      .json({
        message: `Server with ID ${serverId} was updated successfully!`,
      });
  } catch (error) {
    console.error("❌ Error updating server:", error);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};
// Route handler function
const handleDeleteExistServer = async (req, res) => {
  const serverId = parseInt(req.params.serverId); // Get the serverId from the URL

  try {
    // Call the updateServer function with the data
    await deleteExistSerever(serverId);

    // Respond with success message
    res
      .status(200)
      .json({
        message: `Server with ID ${serverId} was deleted successfully!`,
      });
  } catch (error) {
    console.error("❌ Error updating server:", error);
    res
      .status(error.status ? error.status : 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};
module.exports = {
  handleGetServersList,
  handlePostAddNewServer,
  handlePutUpdateExistServer,
  handleDeleteExistServer,
};
