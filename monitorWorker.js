   // Automated Worker to Monitor Server Status
 const monitorServerStatus = () => {
    setInterval(async () => {
        try {
            const result = await pool.query('SELECT 1'); // Simple query to check DB connection
            console.log(`[Worker] Server is healthy at ${new Date().toISOString()}`);
        } catch (err) {
            console.error(`[Worker] Server issue detected: ${err.message}`);
        }
    }, 60000); // Runs every 60 seconds
};

module.exports = monitorServerStatus;
