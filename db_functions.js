const pg = require("pg");

// PostgreSQL Connection Pool
const connection = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
check_onnection();

connection.on("error", function (err, client) {
  console.error("Idle client error", err.message, err.stack);
});

async function check_onnection() {
  try {
    console.debug("try db connection");
    var client = await connection.connect();
    console.info("db connection successful");
  } catch (error) {
    console.error(
      "[db|" +
        arguments.cllerr.name +
        "] Error connecting to db" +
        error.message
    );
  } finally {
    client.release();
  }
  connection.removeAllListeners();
}

async function executeFunction(function_name, args) {
  let res = { result: null, error: null };
  try {
    const client = await connection.connect();
    try {
      res.result = await client.query("CALL " + function_name, args);
    } catch (err) {
      res.error = err.message;
      console.error( "[db_queries|" + arguments.cllerr.name + "] Error calling db function" +  err.message
      );
    } finally {
      client.release();
    }
  } catch (err) {
    res.error = err.message;
    console.error(
      "[db_queries|" + arguments.cllerr.name + "] Error connecting to db" + err.message
    );
  }
  connection.removeAllListeners();
  return res;
}

async function executeQuery(query_Str) {
    let res = { result: null, error: null };
    try {
      const client = await connection.connect();
      try {
        res.result = await client.query(query_Str);
      } catch (err) {
        res.error = err.message;
        console.error( "[db_queries|" + arguments.cllerr.name + "] Error calling db query" +  err.message
        );
      } finally {
        client.release();
      }
    } catch (err) {
      res.error = err.message;
      console.error(
        "[db_queries|" + arguments.cllerr.name + "] Error connecting to db" + err.message
      );
    }
    connection.removeAllListeners();
    return res;
  }
module.exports = {executeFunction,executeQuery,connection};
