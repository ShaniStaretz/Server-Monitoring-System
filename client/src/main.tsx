import * as React from "react";
import { createRoot } from "react-dom/client"; // ✅ Use named import
import { Provider } from "react-redux";
import { store } from "./redux/store";
import App from "./App";

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
