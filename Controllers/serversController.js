const {
  getServersList,
  addNewSerever,
  udpateExistSerever,
  deleteExistSerever,
  getExistSerever,
} = require("../services/serversService");
const { REGEX_PARTTERNS } = require("../utils/REGEX_PATTERNS");

// Route handler function
const handleGetServersList = async (req, res) => {
  try {
    const servers = await getServersList();
    console.log(`found ${servers.length} servers in the system`);
    res.status(200).json(servers);
  } catch (error) {
    console.error("Error in handleGetServersList: ", error.message);
    res
      .status(error.status ? error.status : 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

// Route handler function
const handlePostAddNewServer = async (req, res) => {
  try {
    const { server_url, server_name, username, password } = req.body;

    if (!server_url || !server_name) {
      throw {
        status: 400,
        message: "invalid input, missing required parameters",
      };
    }
    if (!isValidURL(server_url)) {
      throw {
        status: 400,
        message:
          "invalid url format, must at least in format: protocol://host,in protocols:HTTP, HTTPS, FTP, SSH only",
      };
      if ((password && !username) || (username && !password)) {
        throw {
          status: 400,
          message:
            "if invalid username or password",
        };
      }
    }
    const server_id = await addNewSerever(req.body);
    console.log(`added new server to the system with id: ${server_id}`);
    res.status(200).json({ message: "the server was added succefully" });
  } catch (error) {
    console.error("Error in handlePostAddNewServer: ", error.message);
    res
      .status(error.status ? error.status : 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

// Route handler function
const handlePutUpdateExistServer = async (req, res) => {
  const serverId = parseInt(req.params.serverId); // Get the serverId from the URL
  let { server_url } = req.body;
  server_url = server_url.trim();
  try {
    if (!serverId) {
      throw { status: 400, message: "invalid input, missing serverId" };
    }
    if (server_url && !isValidURL(server_url)) {
      throw {
        status: 400,
        message:
          "invalid url format, must at least in format: protocol://host,in protocols:HTTP, HTTPS, FTP, SSH only",
      };
    }
    // Call the updateServer function with the data
    const returned_server = await udpateExistSerever(serverId, req.body);

    // Respond with success message
    res.status(200).json({
      message: `Server with ID ${serverId} was updated successfully!`,
    });
  } catch (error) {
    console.error("Error updating server:", error.message);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

// Route handler function
const handleDeleteExistServer = async (req, res) => {
  const serverId = parseInt(req.params.serverId); // Get the serverId from the URL

  try {
    if (!serverId) {
      throw { status: 400, message: "invalid input, missing serverId" };
    }
    // Call the updateServer function with the data
    await deleteExistSerever(serverId);

    // Respond with success message
    res.status(200).json({
      message: `Server with ID ${serverId} was deleted successfully!`,
    });
  } catch (error) {
    console.error("Error handleDeleteExistServer:", error.message);
    res
      .status(error.status ? error.status : 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

// Route handler function
const handleGetExistServer = async (req, res) => {
  const serverId = parseInt(req.params.serverId); // Get the serverId from the URL

  try {
    if (!serverId) {
      throw { status: 400, message: "invalid input, missing serverId" };
    }
    // Call the updateServer function with the data
    const server = await getExistSerever(serverId);

    // Respond with success message
    res.status(200).json(server);
  } catch (error) {
    console.error("Error handleGetExistServer:", error.message);
    res
      .status(error.status ? error.status : 500)
      .json({ error: error.message || "Internal Server Error" });
  }
};

const isValidURL = (server_url) => {
  return REGEX_PARTTERNS.SERVER_URL.test(server_url);
};
module.exports = {
  handleGetServersList,
  handlePostAddNewServer,
  handlePutUpdateExistServer,
  handleDeleteExistServer,
  handleGetExistServer,
};
