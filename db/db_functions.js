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
      "[db] Error connecting to db" +
        error.message
    );
  } finally {
    client.release();
  }
  pool.removeAllListeners();
}

async function executeFunction(is_get, function_name, args) {
  let res = { result: null, error: null };
  try {
    const client = await pool.connect();
    try {
      if (is_get) {
        res.result = await client.query("SELECT * FROM " + function_name, args);
      } else {
        res.result = await client.query(`CALL  ${function_name}()`, args);
      }
    } catch (err) {
      res.error = err.message;
      console.error( "[db_queries] Error calling db function:" + err.message)
   
    } finally {
      client.release();
    }
  } catch (err) {
    res.error = err.message;
    console.error(
      "[db_queries] Error connecting to db:" +
        err.message
    );
  }
  pool.removeAllListeners();
  return res;
}

async function executeQuery(query_Str) {
  let res = { result: null, error: null };
  try {
    const client = await pool.connect();
    try {
      res.result = await client.query(query_Str);
    } catch (err) {
      res.error = err.message;
      console.error(
        "[db_queries] Error calling db query" +
          err.message
      );
    } finally {
      client.release();
    }
  } catch (err) {
    res.error = err.message;
    console.error(
      "[db_queries] Error connecting to db" +
        err.message
    );
  }
  pool.removeAllListeners();
  return res;
}
module.exports = { executeFunction, executeQuery, pool };
