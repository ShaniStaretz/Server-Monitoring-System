const axios = require('axios');
 // Automated Worker to Monitor Server Status
 
   const monitorServerStatus = (connection) => {
    console.log("start worker")
    const intervalId = setInterval(async () => {
        try {
            const result = await connection.query('SELECT 1'); // Simple query to check DB connection
            console.log(`[Worker] Server is healthy at ${new Date().toISOString()}`);
        } catch (err) {
            console.error(`[Worker] Server issue detected: ${err.message}`);
        }
        finally{

        }
    }, 5000); // Runs every 60 seconds

    return intervalId; 
};

const parseUrl=(url) =>{
    const regex =/^(ftp|http|https|ssh):\/\/([^:/]+)(?::(\d+))?/i;
    const match = url.match(regex);
    
    if (match) {
        const protocol = match[1]; // The protocol (http, https, ftp, ws, wss)
        const host = match[2]; // The host (domain or IP address)
        const port = match[3] || (protocol === 'https' ? '443' : protocol === 'http' ? '80' : protocol === 'ftp' ? '21' : '22'); // Default port based on protocol
        
        return { protocol, host, port };
    }
    
    return null; // Return null if no match is found
}

const checkHttpConnection= async(protocol, host, port)=> {
    const url = `${protocol}://${host}:${port}`;
    const start = Date.now(); // Start time
    try {
        const response = await axios.get(url);
        const latency = Date.now() - start; // Calculate latency
        if (response.status === 200) {
            console.log(`Connection to ${url} successful. Response Latency: ${latency}ms`);
        } else {
            console.log(`Received unexpected status code: ${response.status}. Latency: ${latency}ms`);
        }
    } catch (error) {
        const latency = Date.now() - start;
        console.error(`Error connecting to ${url}: ${error.message}. Latency: ${latency}ms`);
    }
}

module.exports = monitorServerStatus;
