const express = require("express");
const historyRouter = express.Router();
// const { getMonitorHistoryByServerId,addMonitorLogByServerId} = require("../controllers/monitorHistoryController");

// historyRouter.get("/history/:server_id",getMonitorHistoryByServerId)//for testing
// historyRouter.post("/history/",addMonitorLogByServerId)

module.exports=historyRouter