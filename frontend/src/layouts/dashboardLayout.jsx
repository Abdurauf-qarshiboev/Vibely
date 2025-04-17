import { Link, Outlet } from "react-router-dom";
import React, { useState } from "react";
import {
  InstagramOutlined,
  CaretLeftOutlined,
  CaretRightOutlined,
  UploadOutlined,
  HomeOutlined,
  SearchOutlined,
  CompassOutlined,
  PlusSquareOutlined,
  BellFilled,
  UserOutlined,
  MenuOutlined,
} from "@ant-design/icons";
import { Layout, Menu, theme } from "antd";
const { Sider, Content } = Layout;

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="h-full">
      <Layout className="h-full" hasSider>
        <Sider
          theme="dark"
          trigger={null}
          collapsible
          collapsed={collapsed}
          style={{
            paddingTop: "8px",
            paddingLeft: "12px",
            paddingRight: "12px",
            paddingBottom: "20px",
            borderRight: "1px solid #e5e7eb",
          }}
        >
          <Link
            to="/"
            className="flex items-center justify-center space-x-2 h-12 hover:text-white py-3 mb-4"
          >
            {collapsed ? (
              <InstagramOutlined style={{ fontSize: 26 }} />
            ) : (
              <span className="text-lg font-semibold">MilliyGram</span>
            )}
          </Link>

          <Menu
            className="space-y-4"
            theme="dark"
            defaultSelectedKeys={["1"]}
            style={{
              fontSize: 15,
            }}
            items={[
              {
                key: "1",
                icon: (
                  <HomeOutlined
                    style={{
                      fontSize: 20,
                    }}
                  />
                ),
                label: "Home",
              },
              {
                key: "2",
                icon: (
                  <SearchOutlined
                    style={{
                      fontSize: 20,
                    }}
                  />
                ),
                label: "Search",
              },
              {
                key: "3",
                icon: (
                  <CompassOutlined
                    style={{
                      fontSize: 20,
                    }}
                  />
                ),
                label: "Explore",
              },
              {
                key: "4",
                icon: (
                  <BellFilled
                    style={{
                      fontSize: 20,
                    }}
                  />
                ),
                label: "Notifications",
              },
              {
                key: "5",
                icon: (
                  <PlusSquareOutlined
                    style={{
                      fontSize: 20,
                    }}
                  />
                ),
                label: "Create",
              },
              {
                key: "6",
                icon: (
                  <UserOutlined
                    style={{
                      fontSize: 20,
                    }}
                  />
                ),
                label: "Profile",
              },
            ]}
          />
          <button className="flex items-center gap-2 px-4 py-2 text-white hover:bg-white/10 rounded-md transition">
            <MenuOutlined style={{ fontSize: 20 }} />
            <span>More</span>
          </button>
        </Sider>
        <Layout>
          <Content className="overflow-auto hide-scrollbar scroll-smooth">
            <Outlet />
          </Content>
        </Layout>
      </Layout>
    </div>
  );
};
export default DashboardLayout;
