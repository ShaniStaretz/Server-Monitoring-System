const express = require("express");
const historyRouter = express.Router();
const {
  handleGetExistServerHistory,
  handleIsServerHealthyByTimestamp,
} = require("../Controllers/historyController");

historyRouter.get("/:serverId", handleGetExistServerHistory); 
historyRouter.get("/health-status/:serverId", handleIsServerHealthyByTimestamp);

module.exports = historyRouter;
