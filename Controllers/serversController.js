const { getServersList,addNewSerever } = require("../services/serversService");

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
      console.log(`added new server to the system`);
      res.status(200).json(server_id);
    } catch (error) {
      res
        .status(error.status ? error.status : 500)
        .json({ error: error.message || "Internal Server Error" });
    }
  };

module.exports = { handleGetServersList,handlePostAddNewServer };
