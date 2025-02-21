import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Main from "./components/Main";
import ServersTable from "./components/ServersTable";
import Home from "./components/Home";
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#ff4081" },
  },
  typography: { fontFamily: "Arial, sans-serif" }, // Custom font family
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {/* Normalize styles */}
      <Router>
        <Routes>
          <Route path="/" element={<Main />}>
            <Route index path="/" element={<Home />} />
            {/*default route is home*/}
            <Route path="/servers" element={<ServersTable />} />
          </Route>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
