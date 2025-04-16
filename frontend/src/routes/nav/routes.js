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
      title: "Bosh sahifa",
      icon: HomeIcon,
    },
  },
  {
    path: "myblogs",
    name: "myblogs",
    component: MyBlogsPage,
    meta: {
      title: "Mening bloglarim",
      icon: DocumentDuplicateIcon,
    },
  },
  {
    path: "createblogs",
    name: "create-blogs",
    component: CreateBlogs,
    meta: {
      title: "Blog yaratish",
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
      title: "Mening Profilim",
      icon: UserIcon,
    },
  },
];
