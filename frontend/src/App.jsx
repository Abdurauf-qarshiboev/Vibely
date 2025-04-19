"use client";

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Providers 
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import { BlogsProvider } from "./context/main/BlogsContext";
import { HashtagsProvider } from "./context/main/HashtagsContext";
import { ModalProvider } from "./context/main/ModalContext";
import { CommentsProvider } from "./context/main/CommentsContext";
import DashboardLayout from "./layouts/DashboardLayout";
import DashboardPage from "./views/dashboard/DashboardPage";
import  ExplorePage  from "./views/dashboard/blogs/ExplorePage";
import ProfilePage from "./views/dashboard/profile/ProfilePage";
import NotificationsPage from "./views/dashboard/blogs/NotificationsPage";
import CreatePostsPage from "./views/dashboard/blogs/CreatePostsPage";
import AppRoutes from "./routes";

const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <BlogsProvider>
            <HashtagsProvider>
              <CommentsProvider>
                <ModalProvider>
                  <Routes>
                    <Route path="/" element={<DashboardLayout />}>
                      <Route index element={<DashboardPage />} />
                      <Route path="explore" element={<ExplorePage />} />
                      <Route
                        path="notifications"
                        element={<NotificationsPage />}
                      />
                      <Route path="create" element={<CreatePostsPage />} />
                      <Route path="profile" element={<ProfilePage />} />
                    </Route>
                  </Routes>
                </ModalProvider>
              </CommentsProvider>
            </HashtagsProvider>
          </BlogsProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;
