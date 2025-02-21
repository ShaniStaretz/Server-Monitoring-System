import * as React from "react";
import { TextField, Button, Box, Typography } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
const Server = () => {
  const navigate = useNavigate();
  const { serverId } = useParams(); // Get the server ID from the URL (if available)
  const serverDetails = { name: "", url: "", username: "", password: "" };
  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Navigate back to the servers table (or elsewhere)
    navigate("/servers");
  };

  // Handle form submission
  const handleChange = (e: any) => {};
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
            Submit
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default Server;
