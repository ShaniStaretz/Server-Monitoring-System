 const parseUrl = (url) => {
  url=url.toLowerCase()
    const regex = /^(ftp|http|https|ssh):\/\/([^:/]+)(?::(\d+))?/i;
    const match = url.match(regex);
    if (match) {
      const protocol_name = match[1]; // The protocol_name (http, https, ftp, ws, wss)
      const host = match[2]; // The host (domain or IP address)
      const port =
        match[3] ||
        (protocol_name === "https"
          ? "443"
          : protocol_name === "http"
          ? "80"
          : protocol_name === "ftp"
          ? "21"
          : "22"); // Default port based on protocol_name
  
      return { protocol_name, host, port };
    }
  
    return null; // Return null if no match is found
  };

  module.exports = parseUrl