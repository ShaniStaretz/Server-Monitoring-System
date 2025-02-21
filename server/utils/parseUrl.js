const { REGEX_PARTTERNS } = require("../utils/REGEX_PATTERNS");// import regexs
//get url and split it and return its protocol,host, port according to regex
const parseUrl = (url, validProtocols = ["ftp", "http", "https", "ssh"]) => {
  url = url.trim();
let regex=REGEX_PARTTERNS.SERVER_URL
  const match = url.match(REGEX_PARTTERNS.SERVER_URL);

  if (match) {
    const protocol_name = match[1]||'ftp'; // The protocol_name (http, https, ftp, ws, wss) or default ftp if not found 
    const host = match[2]; // The host (domain or IP address)
    //assign port according to protocol
    //TODO: generic and not hard coded protocol names, import from DB
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
  //if failed to split by regex
  throw { status: 400, message: "cannot analyze url" };
};


module.exports = parseUrl;
