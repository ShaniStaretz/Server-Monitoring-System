const shutdown = async (connection, intervalId) => {
    let isPoolClosed = false; 
    console.log('Shutting down...');

    clearInterval(intervalId); // Stop the monitoring interval
   
    try {
        if (!isPoolClosed) {
                await connection.end(); // Close the pool
                 isPoolClosed=true;
                console.log('PostgreSQL pool has been closed.');
        }
        else{
            console.log('PostgreSQL pool has already been closed.');
        }
         // Ensure all promises are resolved before exiting
         await Promise.all([
            // Add any other promises you want to wait for before exiting
        ]);
        console.log('Exiting process.');
        process.exit(0); // Gracefully exit with success code

    } catch (err) {
        console.error('Error closing the pool:', err);
        process.exit(1); // Exit with error code if shutdown fails
    }
};

module.exports = shutdown;