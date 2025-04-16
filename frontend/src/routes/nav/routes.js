import {
  HomeIcon,
  DocumentDuplicateIcon,
  UserIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";

// Lazy loading components
const DashboardPage = () => import("../../views/dashboard/DashboardPage");
const MyBlogsPage = () => import("../../views/dashboard/MyBlogsPage");
const CreateBlogs = () => import("../../views/dashboard/blogs/CreateBlogs");
const ProfilePage = () => import("../../views/dashboard/profile/ProfilePage");

export const mainMenu = [
  {
    path: "",
    name: "home",
    component: DashboardPage,
    meta: {
      title: "Feed",
      icon: HomeIcon,
    },
  },
  {
    path: "myblogs",
    name: "myblogs",
    component: MyBlogsPage,
    meta: {
      title: "My posts",
      icon: DocumentDuplicateIcon,
    },
  },
  {
    path: "createblogs",
    name: "create-blogs",
    component: CreateBlogs,
    meta: {
      title: "Create post",
      icon: PlusCircleIcon,
    },
  },
];

export const profile = [
  {
    path: "profile",
    name: "profile",
    component: ProfilePage,
    meta: {
      title: "Profile",
      icon: UserIcon,
    },
  },
];
