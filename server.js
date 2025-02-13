require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const monitorServerStatus = require('./monitorWorker');

const app = express();
const port = process.env.PORT || 5000;

// PostgreSQL Connection Pool
const connection = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

// Middleware
app.use(express.json());

 // Server Data Structure
 const serverData = {
    name: 'Web Severs Monitoring Syatem',
    url: `http://localhost:${port}`
};



monitorServerStatus();

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

module.exports = {app,connection};