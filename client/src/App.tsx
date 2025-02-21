import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import Table from "./components/Table";
const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1976d2" },
    secondary: { main: "#ff4081" },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Table />
    </ThemeProvider>
  );
}

export default App;
