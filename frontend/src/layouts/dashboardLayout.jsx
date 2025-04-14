import { Outlet } from "react-router-dom";
export default function DashboardLayout() {
  return (
    <div className="p-4">
      {/* dashboard header, sidebar etc */}
      <Outlet />
    </div>
  );
}
