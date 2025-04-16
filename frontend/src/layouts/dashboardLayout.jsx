import { Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center">
      <Outlet />
    </div>
  );
};

export default DashboardLayout;
