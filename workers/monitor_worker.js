const axios = require("axios");
const { Client } = require("ssh2");
const ftp = require("basic-ftp");
const { executeQuery } = require("../db/db_functions");
// Automated Worker to Monitor Server Status

const monitorServerStatus = () => {
  console.log("start worker");
  const intervalId = setInterval(checkServersHealth, 5000); // Runs every 60 seconds

  return intervalId;
};

const checkServersHealth = async () => {
  try {
    const result = await executeQuery("SELECT 1"); // Simple query to check DB connection
    console.log(`[Worker] Server is healthy at ${new Date().toISOString()}`);
  } catch (err) {
    console.error(`[Worker] Server issue detected: ${err.message}`);
  }
};

const parseUrl = (url) => {
  const regex = /^(ftp|http|https|ssh):\/\/([^:/]+)(?::(\d+))?/i;
  const match = url.match(regex);

  if (match) {
    const protocol = match[1]; // The protocol (http, https, ftp, ws, wss)
    const host = match[2]; // The host (domain or IP address)
    const port =
      match[3] ||
      (protocol === "https"
        ? "443"
        : protocol === "http"
        ? "80"
        : protocol === "ftp"
        ? "21"
        : "22"); // Default port based on protocol

    return { protocol, host, port };
  }

  return null; // Return null if no match is found
};

const checkHttpConnection = async (protocol, host, port) => {
  const url = `${protocol}://${host}:${port}`;
  const start = Date.now(); // Start time
  try {
    const response = await axios.get(url);
    const latency = Date.now() - start; // Calculate latency
    if (response.status === 200) {
      console.log(
        `Connection to ${url} successful. Response Latency: ${latency}ms`
      );
    } else {
      console.log(
        `Received unexpected status code: ${response.status}. Latency: ${latency}ms`
      );
    }
  } catch (error) {
    const latency = Date.now() - start;
    console.error(
      `Error connecting to ${url}: ${error.message}. Latency: ${latency}ms`
    );
  }
};

async function checkFtpConnection(host, port) {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  try {
    await client.access({
      host: host,
      port: port,
      user: process.env.FTP_USER, // Or provide your FTP user credentials
      password: process.env.FTP_PASSWORD,
    });
    console.log(`Connected to FTP server at ${host}:${port}`);
  } catch (err) {
    console.error(
      `Failed to connect to FTP server at ${host}:${port}: ${err.message}`
    );
  }
  client.close();
}

function checkSshConnection(host, port) {
  const conn = new Client();
  conn
    .on("ready", () => {
      console.log(`SSH Connection to ${host}:${port} successful`);
      conn.end();
    })
    .on("error", (err) => {
      console.error(
        `Failed to connect to SSH server at ${host}:${port}: ${err.message}`
      );
    })
    .connect({
      host: host,
      port: port,
      username: process.env.SSH_USER, // Provide username
      password: process.env.SSH_PASSWORD, // Provide password or use privateKey
    });
}
module.exports = monitorServerStatus;
