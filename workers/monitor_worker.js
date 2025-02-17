const axios = require("axios");
const { Client } = require("ssh2");
const ftp = require("basic-ftp");
const { addMonitoryLogByServerId } = require("../services/historyService");
const { getServersList } = require("../services/serversService");
const parseUrl =require("../utils/parseUrl")
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


const checkServerHealth = async (server) => {
  const  { protocol, host, port }=parseUrl(server.server_url)
  const {  username, password } = server;
  switch (protocol) {
    case "HTTP":
    case "HTTPS":
      return await checkHttpConnection(protocol, host, port);
      break;
    case "SSH":
      return await checkSshConnection(host, port, username, password);
      break;
    case "FTP":
      return await checkFtpConnection(host, port, username, password);
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
