const axios = require("axios");
const { Client } = require("ssh2");
const ftp = require("basic-ftp");
const { addMonitoryLogByServerId } = require("../services/historyService");
const { getServersList } = require("../services/serversService");
// Automated Worker to Monitor Server Status

const monitorServerStatus = () => {
  console.log("[worker] Start worker");

  const intervalId = setInterval(checkServersHealth, 60000); // Runs every 60 seconds

  return intervalId;
};

const checkServersHealth = async () => {
  try {
    let servers = await getServersList();
    for (const server of servers) {
      let isSuccess = await checkServerHealth(server);
      if (!isSuccess) {
        console.log("[worker] will log Failed for server:", server.server_name);
        await addMonitoryLogByServerId(server.server_id, "Failed");
      } else {
        console.log(
          "[worker] will log Success for server:",
          server.server_name
        );
        await addMonitoryLogByServerId(server.server_id);
      }
    }
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

const checkServerHealth = async (server) => {
  const { protocol_name, server_name, port, username, password } = server;
  switch (protocol_name) {
    case "HTTP":
    case "HTTPS":
      return await checkHttpConnection(protocol_name, server_name, port);
      break;
    case "SSH":
      return await checkSshConnection(server_name, port, username, password);
      break;
    case "FTP":
      return await checkFtpConnection(server_name, port, username, password);
    default:
      break;
  }
  return null;
};

const checkHttpConnection = async (protocol, host, port) => {
  const url = `${protocol}://${host}:${port}`;
  const start = Date.now(); // Start time
  try {
    const response = await axios.get(url);
    const latency = Date.now() - start; // Calculate latency
    if (response.status === 200 && latency < 45000) {
      console.log(
        `[worker] Connection to ${url} successful. Response Latency: ${latency}ms`
      );
      return true;
    } else {
      console.log(
        `[worker] Received unexpected status code: ${response.status}. Latency: ${latency}ms`
      );
      return false;
    }
  } catch (error) {
    const latency = Date.now() - start;
    console.error(
      `[worker] Error connecting to ${url}: ${error.message}. Latency: ${latency}ms`
    );
    return false;
  }
};

const checkFtpConnection = async (host, port, username, password) => {
  const client = new ftp.Client();
  client.ftp.verbose = true;
  const start = Date.now(); // Start time
  try {
    const response = await client.access({
      host: host,
      port: port,
      user: username, // Or provide your FTP user credentials
      password: password,
    });
    const latency = Date.now() - start; // Calculate latency
    if (response && latency < 45000) {
      console.log(`[worker] Connected to FTP server at ${host}:${port}`);
      return true;
    }
  } catch (err) {
    console.error(
      `[worker] Failed to connect to FTP server at ${host}:${port}: ${err.message}`
    );
    return false;
  } finally {
    client.close();
  }
};

const checkSshConnection = async (host, port, username, password) => {
  const connection = new Client();
  const start = Date.now(); // Start time
  try {
    await new Promise((resolve, reject) => {
      connection
        .on("ready", () => {
          console.log(`[worker] SSH Connection to ${host}:${port} successful`);
          connection.end();
        })
        .on("error", (err) => {
          console.error(
            `[worker] Failed to connect to SSH server at ${host}:${port}: ${err.message}`
          );
          return false;
        })
        .connect({
          host: host,
          port: port,
          username: username, // Provide username
          password: password, // Provide password or use privateKey
        });
    });
    const latency = Date.now() - start; // Calculate latency
    if (latency < 45000) {
      return true;
    }
  } catch (error) {
    console.error("[worker] Failed to connect via SSH:", error);
    return false;
  }
};
module.exports = monitorServerStatus;
