require("dotenv").config();
const express = require("express");

const monitorServerStatus = require("./workers/monitor_worker");
const shutdown = require("./utils/shutdown");

const { monitorHistoryRoutes } = require("./routes/historyRoutes");
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
// Use the routes
// app.use(monitorHistoryRoutes);

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

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Handle graceful shutdown
process.on("SIGINT", () => shutdown(server, intervalId)); //signal interrupt
process.on("SIGTERM", () => shutdown(server, intervalId)); //signal Terminate

module.exports = { app };
