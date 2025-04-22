/* eslint-disable no-unused-vars */
import { lazy, Suspense, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { allRoutes } from "./nav/routes";
// Layouts
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const AuthLayout = lazy(() => import("../layouts/AuthLayout"));

// Auth pages
const LoginPage = lazy(() => import("../views/auth/LoginPage"));
const SignupPage = lazy(() => import("../views/auth/SignupPage"));

// Dashboard pages
const DashboardPage = lazy(() => import("../views/dashboard/DashboardPage"));
const ExplorePage = lazy(() => import("../views/dashboard/blogs/ExplorePage"));
const NotificationsPage = lazy(() =>
  import("../views/dashboard/blogs/NotificationsPage")
);
const CreatePostsPage = lazy(() =>
  import("../views/dashboard/blogs/CreatePostsPage")
);
const EditPostPage = lazy(() =>
  import("../views/dashboard/blogs/EditPostPage")
);
const ProfilePage = lazy(() =>
  import("../views/dashboard/profile/ProfilePage")
);
const UserProfilePage = lazy(() =>
  import("../views/dashboard/profile/UserProfilePage")
);
const EditProfilePage = lazy(() =>
  import("../views/dashboard/profile/EditProfilePage")
);
// Loading component
const Loading = () => (
  <div className="flex items-center justify-center h-screen text-white font-bold">
    <img
      className="w-[160px] h-12"
      src="../../public/Logo.png"
      alt="Loading..."
    />
  </div>
);

const AppRoutes = () => {
  const { isAuth, checkUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Improved document title setting logic
    const pathname = location.pathname.endsWith("/")
      ? location.pathname.slice(0, -1)
      : location.pathname;

    // Handle root path
    if (pathname === "") {
      document.title = "Vibely | Home";
      return;
    }

    // Remove leading slash for comparison
    const routePath = pathname.startsWith("/")
      ? pathname.substring(1)
      : pathname;

    // Match static routes first
    if (routePath === "auth/login") {
      document.title = "Vibely | Log in";
      return;
    }
    if (routePath === "auth/signup") {
      document.title = "Vibely | Sign up";
      return;
    }

    // Find matching route in allRoutes
    const matchingRoute = allRoutes.find((route) => {
      // Handle routes with parameters like blogs/:id
      if (route.path.includes(":")) {
        const routePattern = route.path.split("/");
        const currentPathSegments = routePath.split("/");

        if (routePattern.length !== currentPathSegments.length) return false;

        return routePattern.every((segment, index) => {
          if (segment.startsWith(":")) return true; // Parameter matches anything
          return segment === currentPathSegments[index];
        });
      }

      // Exact match for simple routes
      return routePath === route.path;
    });

    if (matchingRoute) {
      document.title = `Vibely | ${matchingRoute.meta.title}`;
    } else if (routePath.startsWith("blogs/")) {
      document.title = "Vibely | Post";
    } else {
      document.title = "Vibely";
    }

    console.log(
      `Route changed: ${routePath} - Title set to: ${document.title}`
    );
  }, [location]);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuthentication = async () => {
      if (sessionStorage.getItem("token") && !isAuth) {
        await checkUser();
      }
    };

    checkAuthentication();
  }, [checkUser, isAuth]);

  useEffect(() => {
    // Redirect logic similar to Vue Router beforeEach
    if (isAuth && location.pathname === "/auth/login") {
      navigate("/");
      return;
    }

    if (
      !location.pathname.includes("/auth") &&
      !isAuth &&
      !sessionStorage.getItem("token")
    ) {
      navigate("/auth/login");
    }
  }, [isAuth, location.pathname, navigate]);

  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        {/* Dashboard Routes */}
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="explore" element={<ExplorePage />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="create" element={<CreatePostsPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="edit-post/:id" element={<EditPostPage />} />
          <Route path="/user/:username" element={<UserProfilePage />} />
          <Route path="/edit-profile" element={<EditProfilePage />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
        </Route>

        {/* Redirect to dashboard if no route matches */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
