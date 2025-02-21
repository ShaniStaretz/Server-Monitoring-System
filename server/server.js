require("dotenv").config();
const express = require("express");
const initTables = require("./db/initTables");
const bodyParser = require('body-parser');
const createTriggers = require("./db/initTriggers"); 
const monitorServerStatus = require("./workers/monitor_worker");
const shutdown = require("./utils/shutdown");
const serversRoutes = require("./routes/serversRoutes");
const monitorHistoryRoutes  = require("./routes/historyRoutes");
const app = express();
const port = process.env.PORT || 5000;

// Middleware to parse JSON bodies
app.use(bodyParser.json()); 
// Use the routes
app.use("/api/history",monitorHistoryRoutes);
app.use("/api/servers",serversRoutes);

// Server Data Structure
const serverData = {
  name: "Web Severs Monitoring Syatem",
  url: `http://localhost:${port}`,
};

const intervalId = monitorServerStatus();

// Test Route
app.get("/", (req, res) => {
  res.json({
    message: "Express + PostgreSQL API is running!",
    server: serverData,
  });
});

const server = app.listen(port, async () => {
  console.log(`[server] Server is running on http://localhost:${port}`);
  // Initialize tables first
  await initTables();
  // Initialize triggers
  await createTriggers();
});

// Handle graceful shutdown
process.on("SIGINT", () => shutdown(server, intervalId)); //signal interrupt
process.on("SIGTERM", () => shutdown(server, intervalId)); //signal Terminate

module.exports = { app };
