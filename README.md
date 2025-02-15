# Server-Monitoring-System

## Overview

The Servers Monitoring System is designed to monitor server health, track status changes, and send real-time notifications. This solution integrates with a PostgreSQL database, using functions, triggers, and a Node.js backend to provide alerts based on server health.

### Key Features

*  Real-Time Server Health Monitoring: Monitors servers and tracks whether they are Healthy or Unhealthy.
* Automated Alerts: Sends notifications when a server changes status.
* Historical Data: Logs status updates for each server.
* Database Integration: Uses PostgreSQL for storing server data and managing triggers.

## Technologies Used
* Backend: Node.js, Express
* Database: PostgreSQL
* Email Notifications: Nodemailer
* FTP Server Connectivity: Basic-FTP library
* Triggers and Stored Procedures: PostgreSQL functions to manage server status and logs.

## Project Setup
### Prerequisites
Make sure you have the following installed:

* Node.js (v12 or higher)
* PostgreSQL (v12 or higher)

## Environment Setup

1. Clone the repository:
```
git clone https://github.com/ShaniStaretz/Server-Monitoring-System.git
cd servers-monitoring
```
2. Install dependencies:

```
npm install
```
3. Set up PostgreSQL database:
make sure you have server and database connection ready.

4.Set up environment variables:
```
PORT=your_app_port # or default value will take place =3000
DB_HOST=localhost
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=server-monitoring-system
DB_PORT=5432

EMAIL_USERNAME=your_email_address
EMAIL_PASSWORD=your_app_password
EMAIL_SERVICE=your_email_provider
EMAIL_recipient=your_email_address_recipient

# SECRET_KEY=your_secret_key # or default value will take place
```
## Running the Application
1. **Start the server:**
Run the following command to start the Node.js server:
```
npm start
```
this will launch the Node.js server on http://localhost:3000.

2. **Accessing the API:**

    All REST API endpoints starts with /api
* **Get all servers**:

    Endpoint: GET /servers

    Description: Retrieves a list of all servers along with their current status.
* **Get server by ID:**

    Endpoint: GET /servers/:id
    Description: Retrieves the status and other details of a specific server by its ID.
* **Get server health history:**

    Endpoint: GET /history/:id

    Description: Returns all the server's monitorying logs
* **Add new server:**
    Endpoint: POST /server/

    Description: Add new server for monitor

## Triggers & Notifications
The system uses PostgreSQL triggers to update server statuses.
* update current status of the server to be 'Healthy' if last 5 monitory logs are 'Success'
* update current status of the server to be 'Unhealthy' if last 3 monitory logs are 'Failed'
* if current status of the server is 'Unhealthy' the system will send notification alerts accordingly.

Ensure your PostgreSQL database is set up with all necessary functions, triggers, and tables.

## Limitations:
*Protocol name needs to be one if the following options: HTTP, HTTPS, FTP, SSH
* server name needs to include the domain and the Top-Level Domain (TLD):
Example:https://www.example.com

* no 2 servers with the same server name
* 
## Troubleshooting
* "Server not found" error: Verify your PostgreSQL database connection settings in the .env file.
* Email notifications not working: Make sure your SMTP credentials are valid and that your SMTP service supports external connections.
* Trigger or function creation errors: Ensure that the functions and triggers have been properly created in your PostgreSQL database.
