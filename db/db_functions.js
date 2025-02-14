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
  console.error("Idle client error", err.message, err.stack);
});

// Listen for notifications on the 'server_status_change' channel
pool.query("LISTEN server_status_change");

// Event listener for notifications
pool.on("notification", (msg) => {
  console.log("Received notification:", msg.payload);

  // Check if the notification is about an unhealthy server
  if (msg.payload.includes("Unhealthy")) {
    // Parse the server ID and status from the notification payload
    const serverId = msg.payload.split(" ")[1]; // Assuming the message is like 'Server <id> is now Unhealthy'
    const subject = `Alert: Server ${serverId} is Unhealthy`;
    const text = `The server with ID ${serverId} is now marked as Unhealthy.`;
    const emailTo = "recipient@example.com";

    // Send the email
    sendEmail(subject, text, emailTo);
  }
});
console.log("Listening for PostgreSQL notifications...");

async function check_onnection() {
  try {
    console.debug("try db pool");
    var client = await pool.connect();
    console.info("db pool successful");
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
    console.error(err);
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
    console.error("[db_queries] Error connecting to db" + err.message+ " with code:"+err.code);
  }
  pool.removeAllListeners();
  return res;
}
module.exports = { executeFunction, executeQuery, pool };
