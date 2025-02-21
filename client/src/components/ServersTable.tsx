import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
} from "@mui/material";
import "../styles/Table.css";

type Server = {
  id: number;
  name: string;
  url: string;
  status: string;
  username: string;
  password: string;
};

const servers: Server[] = [
  {
    id: 1,
    name: "John Doe",
    url: "http://example.com",
    username: "johndoe",
    password: "password123",
    status: "Healthy",
  },
  {
    id: 2,
    name: "Jane Smith",
    url: "http://example.org",
    username: "janesmith",
    password: "mypassword",
    status: "Unealthy",
  },
  {
    id: 3,
    name: "Mark Johnson",
    url: "http://example.net",
    username: "markj",
    password: "password456",
    status: "Healthy",
  },
];

const ServersTable: React.FC = () => {
  return (
    <Box className="myBox">
      <TableContainer component={Paper} className="myTableContainer">
        <Typography variant="h5" align="center">
          Server Monitoring Table
        </Typography>
        <Table className="myTable">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Status</TableCell>

              <TableCell>Username</TableCell>
              <TableCell className="hiddenColumn">Password</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {servers.map((server) => (
              <TableRow key={server.id}>
                <TableCell>{server.id}</TableCell>
                <TableCell>{server.name}</TableCell>
                <TableCell>{server.url}</TableCell>
                <TableCell
                  sx={{
                    color: server.status === "Healthy" ? "Unhealthy" : "red",
                    fontWeight: "bold",
                  }}
                >
                  {server.status}
                </TableCell>
                <TableCell>{server.username}</TableCell>
                <TableCell>
                  <input
                    type="password"
                    value={server.password}
                    readOnly
                    style={{ border: "none", backgroundColor: "transparent" }} // Style to match table cell appearance
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ServersTable;
