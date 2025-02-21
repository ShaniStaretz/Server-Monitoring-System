import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../redux/store";
import { setServers, deleteServer } from "../redux/serverSlice";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import { ServerType } from "../types/Server";

const ServersTable = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { servers, loading, error } = useSelector(
    (state: RootState) => state.servers
  );
  // const servers: ServerType[] = [
  //   {
  //     id: 1,
  //     name: "John Doe",
  //     url: "http://example.com",
  //     username: "johndoe",
  //     password: "password123",
  //     status: "Healthy",
  //   },
  //   {
  //     id: 2,
  //     name: "Jane Smith",
  //     url: "http://example.org",
  //     username: "janesmith",
  //     password: "mypassword",
  //     status: "Unealthy",
  //   },
  //   {
  //     id: 3,
  //     name: "Mark Johnson",
  //     url: "http://example.net",
  //     username: "markj",
  //     password: "password456",
  //     status: "Healthy",
  //   },
  // ];
  useEffect(() => {
    // Simulate fetching data from API
    const fetchData = async () => {
      dispatch(
        setServers([
          {
            id: 1,
            name: "Server 1",
            url: "http://server1.com",
            status: "Active",
            username: "admin",
          },
          {
            id: 2,
            name: "Server 2",
            url: "http://server2.com",
            status: "Inactive",
            username: "user",
          },
        ])
      );
    };
    fetchData();
  }, [dispatch]);
  const navigate = useNavigate();
  // Handle name column click to navigate to edit server page
  const handleNameClick = (id: number) => {
    navigate(`/servers/edit/${id}`); // Navigate to the edit page for the clicked server
  };
  return (
    <Box className="myBox">
      <TableContainer component={Paper} className="myTableContainer">
        <Typography variant="h5" align="center">
          Servers Monitoring Table
        </Typography>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        <Table className="myTable">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>URL</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Username</TableCell>
              <TableCell>Password</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {servers.map((server) => (
              <TableRow key={server.id}>
                <TableCell>{server.id}</TableCell>
                <TableCell>
                  <span
                    style={{ color: "blue", cursor: "pointer" }}
                    onClick={() => handleNameClick(server.id)}
                  >
                    {server.name}
                  </span>
                </TableCell>
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
