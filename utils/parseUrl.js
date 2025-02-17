const { REGEX_PARTTERNS } = require("../utils/REGEX_PATTERNS");
const parseUrl = (url) => {
  url = url.trim();

  const match = url.match(REGEX_PARTTERNS.SERVER_URL);

  if (match) {
    const protocol_name = match[1]||'ftp'; // The protocol_name (http, https, ftp, ws, wss)
    const host = match[2]; // The host (domain or IP address)
    let port = "";

    switch (protocol_name) {
      case "https":
        port = "443";
        break;
      case "http":
        port = "80";
        break;
      case "ssh":
        port = "22";
        break;
      
      default:
        port = "21";
        break;
    }
    return { protocol_name, host, port };
  }
  throw { status: 400, message: "cannot analyze url" };
};


module.exports = parseUrl;
