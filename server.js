require('dotenv').config();
const express = require('express');
const connection = require('./db_functions'); // Import the database pool
const monitorServerStatus = require('./monitorWorker');
const shutdown =require('./shutdown')
const app = express();
const port = process.env.PORT || 5000;



// Middleware
app.use(express.json());

 // Server Data Structure
 const serverData = {
    name: 'Web Severs Monitoring Syatem',
    url: `http://localhost:${port}`
};



const intervalId=monitorServerStatus(connection);



 // Test Route
 app.get('/', (req, res) => {
    res.json({ message: 'Express + PostgreSQL API is running!', server: serverData });
});

// Start Server only if not in test mode
if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    });
}
// Handle graceful shutdown
process.on('SIGINT', () => shutdown(connection, intervalId)); //signal interrupt
process.on('SIGTERM', () => shutdown(connection, intervalId)); //signal Terminate

module.exports = {app,connection};