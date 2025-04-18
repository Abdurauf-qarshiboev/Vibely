"use client";

import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";

// Providers 
import { BlogsProvider } from "./context/main/BlogsContext";
import { HashtagsProvider } from "./context/main/HashtagsContext";
import { ModalProvider } from "./context/main/ModalContext";
import AppRoutes from "./routes";

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <BlogsProvider>
            <HashtagsProvider>
              <ModalProvider>
                <AppRoutes />
              </ModalProvider>
            </HashtagsProvider>
          </BlogsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
