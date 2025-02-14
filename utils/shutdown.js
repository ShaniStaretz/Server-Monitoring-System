const { pool } = require("../db/db_functions");
const shutdown = async (server, intervalId) => {
  console.log("Shutting down...");

  clearInterval(intervalId); // Stop the monitoring interval
  // Stop accepting new requests
  if (server && typeof server.close === "function") {
    server.close(() => {
      console.log("Express server closed.");
    });
  }
  try {
    if (!pool.ended || !pool.ending) {
      await pool.end(); // Close the pool
      console.log("PostgreSQL pool has been closed.");
    } else {
      console.log("PostgreSQL pool has already been closed.");
    }
    // Ensure all promises are resolved before exiting
    await Promise.all([
      // Add any other promises you want to wait for before exiting
    ]);
    console.log("Exiting process.");
    process.exit(0); // Gracefully exit with success code
  } catch (err) {
    console.error("Error closing the pool:", err);
    process.exit(1); // Exit with error code if shutdown fails
  }
};
// Handle termination signals
process.on("SIGINT", () => shutdown()); // Ctrl+C
process.on("SIGTERM", () => shutdown()); // System shutdown

module.exports = shutdown;
