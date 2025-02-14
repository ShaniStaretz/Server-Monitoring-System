const express = require("express");
const serversRouter = express.Router();
const { handleGetServersList,handlePostAddNewServer,handlePutUpdateExistServer} = require("../Controllers/serversController.js");


serversRouter.get("/",handleGetServersList);
serversRouter.post("/",handlePostAddNewServer);
serversRouter.put("/:serverId",handlePutUpdateExistServer)

module.exports=serversRouter