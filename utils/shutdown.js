const { pool } = require("../db/db_functions");
const shutdown = async (server, intervalId) => {
  console.log("[shutdown] Shutting down...");

  clearInterval(intervalId); // Stop the monitoring interval
  // Stop accepting new requests
  if (server && typeof server.close === "function") {
    server.close(() => {
      console.info("[shutdown] Express server closed.");
    });
  }
  try {
    if (!pool.ended || !pool.ending) {// verify pool is not close already
      await pool.end(); // Close the pool
      console.info("[shutdown] PostgreSQL pool has been closed.");
    } else {
      console.info("[shutdown] PostgreSQL pool has already been closed.");
    }
    
    console.info("[shutdown] Exiting process.");
    process.exit(0); // Safely exit with success code
  } catch (err) {
    console.error("[shutdown] Error closing the pool:", err);
    process.exit(1); // Exit with error code if shutdown fails
  }
};
// Handle termination signals
process.on("SIGINT", () => shutdown()); // Ctrl+C
process.on("SIGTERM", () => shutdown()); // System shutdown

module.exports = shutdown;
