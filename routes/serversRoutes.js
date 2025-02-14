const express = require("express");
const serversRouter = express.Router();
const { handleGetServersList,handlePostAddNewServer,handlePutUpdateExistServer,handleDeleteExistServer} = require("../Controllers/serversController.js");


serversRouter.get("/",handleGetServersList);
serversRouter.post("/",handlePostAddNewServer);
serversRouter.put("/:serverId",handlePutUpdateExistServer)
serversRouter.delete("/:serverId",handleDeleteExistServer)

module.exports=serversRouter