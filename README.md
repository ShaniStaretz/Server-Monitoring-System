# **Server-Monitoring-System**

## Overview

The Servers Monitoring System is designed to monitor server health, track status changes, and send real-time notifications. This solution integrates with a PostgreSQL database, using functions, triggers, and a Node.js backend to provide alerts based on server health.

The server follows the MVC (Model-View-Controller) architecture.

## **📂 Project Structure**
```
/Server-Monitoring-System
│── /server      # Backend (Node.js/Express)
│── /client      # Frontend (React + Vite or CRA)
│── README.md    # Documentation
```

## **Getting Started**

### **Clone the Repository**
```
git [clone <your-github-repo-url>](https://github.com/ShaniStaretz/Server-Monitoring-System.git)
cd Server-Monitoring-System
```

---

## **🛠 Backend Setup (Server)**
Navigate to the `server` folder and install dependencies:
```
cd server
npm install
```
### **Environment Variables**
Create a `.env` file inside `server/` with necessary variables:
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
SECRET_KEY=your_secret_key # or default value will take place
```
### **Start the Backend**
```
npm start   # For normal start
```
The server will run on **`http://localhost:5000`** (or your configured port).
This will launch the Node.js server on http://localhost:5000, or your selected port.
---

## **Frontend Setup (Client)**
Navigate to the `client` folder and install dependencies:
```
cd ../client
npm install
```
### **🔧 Environment Variables**
Create a `.env` file inside `client/`:
```
VITE_API_BASE_URL=http://localhost:5000
```
### **Start the Frontend**
```sh
npm run start  # (For Vite)
```
The frontend will run on **`http://localhost:5173`** (or default React port).

---

## **🚀 Running Both Server & Client Together**
You can run both frontend and backend in parallel using **concurrently**:
1. Install `concurrently` in the root folder:
   ```sh
   npm install -g concurrently
   ```
2. Add this script inside the root `package.json`:
   ```json
   "scripts": {
     "dev": "concurrently \"cd server && npm run dev\" \"cd client && npm run dev\""
   }
   ```
3. Run:
   ```
   npm run dev
   ```
This will start both the frontend and backend simultaneously.

---

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


## *** **updated project** ***:
* the server can be any string possible, but still UNIQUE in the DB
* removed from servers_list the port and protocol_id fields, no need for them to check connection with the remote server.
* the worker get all servers from the DB, for each server splite server_url and get the protocol and the port automatically.
* left the protocols_list table and it's functions related.


---

## **📌 Useful Commands**
| Command                  | Description                       |
|--------------------------|-----------------------------------|
| `npm install`           | Install dependencies             |
| `npm start`             | Start the server/frontend        |
| `npm run dev`           | Run both frontend and backend    |
| `npm run build`         | Build frontend for production    |

---

## **🔗 Tech Stack**
- **Frontend:** React + Vite / CRA
- **Backend:** Node.js + Express
- **Database:** PostgreSQL
- **FTP Server Connectivity**: Basic-FTP library
- **Email Notifications**: Nodemailer
- **Encryption**: crypto 

---

## **💡 Contributing**
1. Fork the repository.
2. Create a new branch: `git checkout -b feature-branch`
3. Commit your changes: `git commit -m "Add new feature"`
4. Push to the branch: `git push origin feature-branch`
5. Open a pull request.

---

## **📜 License**
This project is licensed under the MIT License.

