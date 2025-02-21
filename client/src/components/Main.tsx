import * as React from "react";
import { Link, Outlet } from "react-router-dom";
import { Box, Button } from "@mui/material";
import Header from "./Header";
const Main = () => {
  return (
    <div>
      <Header />
      {/* Navigation links displayed in a row */}
      <Box sx={{ display: "flex", justifyContent: "space-around", padding: 2 }}>
        <Button component={Link} to="/" variant="contained">
          Home
        </Button>
        <Button component={Link} to="/servers" variant="contained">
          Servers Table
        </Button>
      </Box>

      <Outlet />
    </div>
  );
};

export default Main;
