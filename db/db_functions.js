const { Pool } = require("pg");
// PostgreSQL pool Pool
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  max: 10, // Max number of connections in the pool
});

check_onnection();

pool.on("error", function (err, client) {
  console.error("[db] Idle client error", err.message, err.stack);
});

async function check_onnection() {
  try {
    console.debug("[db] Try db pool");
    var client = await pool.connect();
    console.info("[db] db pool successful");
  } catch (error) {
    console.error(
      "[db] Error connecting to db:" +
        error.message +
        " with code:" +
        error.code
    );
  } finally {
    client.release();
  }
  pool.removeAllListeners();
}

async function listenForNotifications() {
  const client = await pool.connect(); // Get a client from the pool

  try {
    console.info("[db] Listening for PostgreSQL notifications...");

    // Start listening to the 'server_status_change' channel
    await client.query("LISTEN server_status_change");

    // Handle incoming notifications
    client.on("notification", (msg) => {
      console.debug("[db] Notification received:", msg.payload);
    });

    // Keep the client connection alive
    client.on("end", () => {
      console.info("[db] Listener client disconnected");
    });

    process.on("SIGINT", async () => {
      console.info(" [db] Closing pool connection...");
      client.release(); // Release back to the pool
      process.exit();
    });
  } catch (error) {
    console.error("[db] Error listening for notifications:", error);
    client.release(); // Release client back to the pool
  }
}
// Run the listener after a short delay (optional)
setTimeout(() => {
  listenForNotifications();
}, 2000);

async function executeFunction(is_get, function_name, args = null) {
  let res = { result: null, error: null };

  try {
    const client = await pool.connect();

    try {
      // Create a query string with placeholders for parameters
      const paramPlaceholders = !args
        ? null
        : args.map((_, index) => `$${index + 1}`).join(", ");
      let query_Str = is_get ? "SELECT * FROM " : "CALL ";
      query_Str += `${function_name}`;
      query_Str += paramPlaceholders ? `(${paramPlaceholders})` : `()`;
      res.result = await client.query(query_Str, args);
    } catch (err) {
      res.error = { message: err.message, code: err.code || "UNKNOWN_ERROR" };
      console.error("[db_queries] Error calling db function:" + err.message);
    } finally {
      client.release();
    }
  } catch (err) {
    res.error = err.message;
    console.error(
      "[db_queries] Error connecting to db:" +
        err.message +
        " with code:" +
        err.code
    );
  }
  pool.removeAllListeners();
  return res;
}

async function executeQuery(query_Str, params = null) {
  let res = { result: null, error: null };
  try {
    const client = await pool.connect();
    try {
      res.result = await client.query(query_Str, params);
    } catch (err) {
      res.error = { message: err.message, code: err.code || "UNKNOWN_ERROR" };
      console.error("[db_queries] Error calling db query:" + err.message);
    } finally {
      client.release();
    }
  } catch (err) {
    res.error = err.message;
    console.error(
      "[db] Error connecting to db" +
        err.message +
        " with code:" +
        err.code
    );
  }
  pool.removeAllListeners();
  return res;
}
module.exports = { executeFunction, executeQuery, pool };
