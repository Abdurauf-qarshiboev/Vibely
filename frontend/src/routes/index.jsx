import { lazy, Suspense, useEffect } from "react";
import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { mainMenu, profile } from "./nav/routes";

// Layouts
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const AuthLayout = lazy(() => import("../layouts/AuthLayout"));

// Auth pages
const LoginPage = lazy(() => import("../views/auth/LoginPage"));
const SignupPage = lazy(() => import("../views/auth/SignupPage"));

// Dashboard pages
const DashboardPage = lazy(() => import("../views/dashboard/DashboardPage"));
const MyBlogsPage = lazy(() => import("../views/dashboard/MyBlogsPage"));
const CreateBlogs = lazy(() => import("../views/dashboard/blogs/CreateBlogs"));
const EditBlogs = lazy(() => import("../views/dashboard/blogs/EditBlogs"));
const ProfilePage = lazy(() =>
  import("../views/dashboard/profile/ProfilePage")
);

// Loading component
const Loading = () => (
  <div className="flex items-center justify-center h-screen">Loading...</div>
);

const AppRoutes = () => {
  const { isAuth, checkUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Set document title based on route
    const currentRoute = [...mainMenu, ...profile].find(
      (route) =>
        location.pathname === `/${route.path}` ||
        location.pathname === `/${route.path}/`
    );

    if (currentRoute) {
      document.title = `KOKOgram | ${currentRoute.meta.title}`;
    } else if (location.pathname.includes("/auth/login")) {
      document.title = "KOKOgram | Log in";
    } else if (location.pathname.includes("/auth/signup")) {
      document.title = "KOKOgram | Sign up";
    } else if (location.pathname.includes("/blogs/")) {
      document.title = "KOKOgram | Post";
    }
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
          <Route path="myblogs" element={<MyBlogsPage />} />
          <Route path="createblogs" element={<CreateBlogs />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="blogs/:id" element={<EditBlogs />} />
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
