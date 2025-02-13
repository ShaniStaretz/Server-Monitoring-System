   // Automated Worker to Monitor Server Status
 const monitorServerStatus = (connection) => {
    console.log(connection)
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

module.exports = monitorServerStatus;
