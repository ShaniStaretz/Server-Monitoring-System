import * as React from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { ServerType } from "../types/Server";
import { useDispatch } from "react-redux";
import { addServer, updateServer } from "../redux/serverSlice";
const Server = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { serverId } = useParams(); // Get the server ID from the URL (if available)
  const [serverDetails, setServerDetails] = useState<ServerType>({
    id: 0,
    name: "",
    url: "",
    username: "",
    password: "",
  });

  // Fetch existing server data for edit mode
  useEffect(() => {
    if (serverId) {
      // Simulate fetching server data based on ID (replace with actual API call)
      const existingServer: ServerType = {
        id: +serverId,
        name: "Example Server",
        url: "https://example.com",
        username: "admin",
        password: "admin123",
      };
      setServerDetails({
        ...existingServer,
        username: existingServer.username ?? "", // Default to empty string if undefined
        password: existingServer.password ?? "",
      }); // Pre-fill the form with existing data
    }
  }, [serverId]);
  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (serverId) {
      // Update the existing server (send the data to your API)
      dispatch(updateServer(serverDetails));
      console.log("Updating Server Details:", serverDetails);
      alert("Server details updated!");
    } else {
      // Add a new server (send the data to your API)
      dispatch(addServer(serverDetails));
      console.log("Adding New Server:", serverDetails);
      alert("New server added!");
    }

    // Reset form after submission
    setServerDetails({
      id: 0,
      name: "",
      url: "",
      status: "",
      username: undefined,
      password: undefined,
    });
    // Navigate back to the servers table (or elsewhere)
    navigate("/servers");
  };

  // Handle input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setServerDetails({
      ...serverDetails,
      [name]: value,
    });
  };
  return (
    <Box sx={{ maxWidth: 400, margin: "auto", padding: 2 }}>
      <Typography variant="h5" gutterBottom>
        Add Server Details
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Server Name"
          name="name"
          value={serverDetails.name}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Server URL"
          name="url"
          value={serverDetails.url}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Username"
          name="username"
          value={serverDetails.username}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Password"
          name="password"
          type="password"
          value={serverDetails.password}
          onChange={handleChange}
          fullWidth
          margin="normal"
        />

        <Box sx={{ display: "flex", justifyContent: "center", marginTop: 2 }}>
          <Button type="submit" variant="contained" color="primary">
            {serverId ? "Update Exist Server" : "Add New Server"}
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default Server;
