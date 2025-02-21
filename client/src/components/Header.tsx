import * as React from "react";
import { AppBar, Toolbar, Typography } from "@mui/material";
const Header = () => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h3" className="myTypography" sx={{ flexGrow: 1 }}>
          Servers Monitoring System
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
