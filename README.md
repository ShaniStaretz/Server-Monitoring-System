# Server-Monitoring-System

## Overview

The Servers Monitoring System is designed to monitor server health, track status changes, and send real-time notifications. This solution integrates with a PostgreSQL database, using functions, triggers, and a Node.js backend to provide alerts based on server health.

The application follows the MVC (Model-View-Controller) architecture, which ensures a clean separation of concerns and modularizes the codebase for easier maintenance and scalability.

### Key Features

*  Real-Time Server Health Monitoring: Monitors servers and tracks whether they are Healthy or Unhealthy.
* Automated Alerts: Sends notifications when a server changes status.
* Historical Data: Logs status updates for each server.
* Database Integration: Uses PostgreSQL for storing server data and managing triggers.
* The system creates the tables and trigger if their not exist in the database.
* The system encrypt the server's access passowrd, if exist, before entering the database.

## Technologies Used
* Backend: Node.js, Express
* Database: PostgreSQL
* Email Notifications: Nodemailer
* FTP Server Connectivity: Basic-FTP library
* Triggers and Stored Procedures: PostgreSQL functions to manage server status and logs.
* Encryption: crypto library

## Project Setup
### Prerequisites
Make sure you have the following installed:

* Node.js (v12 or higher)
* PostgreSQL (v12 or higher)

  ** used for development:
      * Node.js (v18.5)
      * PostgreSQL(v16)

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
** Please note the app does not create the PostgreSQL inner functions and procedures, only the triggers and tables

4. Set up environment variables:
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
      
        Example:
         ```
          curl -X GET http://localhost:5000/api/servers
         ```
    * **Get server by ID:**
        Endpoint: GET /servers/:serverId
        Description: Retrieves the all details of a specific server and it's 10 first monitory log history by its ID.
      
        Example:
         ```
          curl -X GET http://localhost:5000/api/servers/1
         ```

    * **Get server health history:**
        Endpoint: GET /history/:serverId
        Description: Returns all the server's monitorying logs by its ID.
      
        Example:
         ```
          curl -X GET http://localhost:5000/api/history/1
         ```
         
    * **Get if  a server was Healthy by given TimeStamp**:
        Endpoint GET history/health-status/:serverId? timestamp=
        Description: Returns True and in the giving timestamp the server was healthy, else return False.
        * URL Parameters:
            *serverId (path parameter) – The unique identifier of the server whose health status history you wish to retrieve.
            * timestamp (query parameter) – The timestamp to fetch the health status from the history. It should be in the format YYYY-MM-DD HH:MM:SS.
              
        * **Add new server:**
            Endpoint: POST /servers/
            Description: Add new server for monitor
            * Request Body:
                The request body should be a JSON object that includes the necessary server information: server_name,port,protocol_name,username, password.
              
                Body Example:
                ```
                    {
                        "server_name": "ftp.dlptest.com5",
                        "server_url":"ftp.dlptest.com",
                        "port": 22,
                        "protocol_name":"ftp",
                        "username":"dlpuser",
                        "password":"rNrKYTX9g7z3RgJRmxWuGHbeu"
                    }
                ```
                ** When username, password are optional fields.
              
                Example:
                 ```
                   curl -X POST -H "Content-Type: application/json" \
                   -d '{ "server_name": " ftp.dlptest.com5","port": 22,"protocol_name":"ftp","username":"dlpuser","password":"rNrKYTX9g7z3RgJRmxWuGHbeu"}' \
                   http://localhost:5000/servers/

                 ```

    * **Update Exist server:**
      Endpoint: PUT /server/:serverId
        Description: Update an exist server for monitor
        * URL Parameters:
            *serverId (path parameter) – The unique identifier of the server whose health status history you wish to update.
        * Request Body:
            The request body should be a JSON object that can include all the server's information.
          
            Body Example:
            ```
            {
                "currentStatus": "Unhealthy",
                "serverName": "Updated Server Name",
                "port": 9090,
                "protocol_name": "SSH"
            }
            ```
            ** When username, password are optional fields.
          
          Example:
                 ```
                   curl -X PUT -H "Content-Type: application/json" \
                   -d '{ "protocol_name": "SSH",port": 9090,"serverName": "Updated Server Name","currentStatus": "Unhealthy"}' \
                   http://localhost:5000/servers/1
                 ```
          
   * **delete server by ID:**
       Endpoint: DELETE /servers/:serverId
       Description: Delete an exist server from the system, including its records from the monitory history.
     
       Example:
                 ```
                   curl -X DELETE  http://localhost:5000/servers/1
                 ```
## optional Endpoint usages:
* **Test Monitorying System**:
    Endpoint: GET /
    Description: Verify the server is up and running.
  
    Example:
                 ```
                   curl -X GET http://localhost:5000/
                 ```

## Triggers & Notifications
The system uses PostgreSQL triggers to update server statuses.
* update current status of the server to be 'Healthy' if last 5 monitory logs are 'Success'.
* update current status of the server to be 'Unhealthy' if last 3 monitory logs are 'Failed'
* if current status of the server is 'Unhealthy' the system will send notification alerts accordingly.

Ensure your PostgreSQL database is set up with all necessary functions, triggers, and tables.

## Limitations:
* Protocol name needs to be one if the following options: HTTP, HTTPS, FTP, SSH.
* server name needs to include the domain and the Top-Level Domain (TLD):
    Example:www.example.com, httpbin.org
* no 2 servers with the same server name.
  
## Troubleshooting
* "Server not found" error: Verify your PostgreSQL database connection settings in the .env file.
* Email notifications not working: Make sure your SMTP credentials are valid and that your SMTP provider supports external connections.
* Trigger or function creation errors: Ensure that the functions and triggers have been properly created in your PostgreSQL database.


## updated project:
* removed from servers_list the port and protocol_id fields, no need for them to check connection with the remote server.
* the worker get all servers from the DB, for each server splite server_url and get the protocol and the port automatically.
* left the protocols_list table and it's functions related.

