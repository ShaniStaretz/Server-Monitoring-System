const express = require("express");
const serversRouter = express.Router();
const { handleGetServersList,handlePostAddNewServer} = require("../Controllers/serversController.js");


serversRouter.get("/",handleGetServersList)
serversRouter.post("/",handlePostAddNewServer)

module.exports=serversRouter