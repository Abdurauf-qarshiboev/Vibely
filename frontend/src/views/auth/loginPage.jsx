import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Input, Tooltip, Button, Form, message } from "antd";
import {
  UserOutlined,
  InfoCircleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  LockOutlined,
} from "@ant-design/icons";

export default function LoginPage() {
  const [form] = Form.useForm();
  const { login } = useAuth();

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      await login(values);
    } catch (error) {
      console.error("Login failed:", error);
      message.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-start px-6 py-12 lg:px-8 bg-gray-50 text-gray-900">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2 className="mt-10 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
          Sign in
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <Form
          form={form}
          name="login"
          onFinish={handleSubmit}
          layout="vertical"
          requiredMark={false}
        >
          {/* Username Field */}
          <Form.Item
            name="username"
            rules={[{ required: true, message: "Please enter your username" }]}
            label={<span className="text-gray-900">Username</span>}
          >
            <Input
              prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Enter your username"
              suffix={
                <Tooltip title="Your unique username for login">
                  <InfoCircleOutlined style={{ color: "rgba(0,0,0,.45)" }} />
                </Tooltip>
              }
            />
          </Form.Item>

          {/* Password Field */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
            label={
              <div className="flex items-center gap-2 justify-between w-full">
                <span className="text-gray-900">Password</span>
              </div>
            }
          >
            <Input.Password
              autoComplete="current-password"
              prefix={<LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Enter your password"
              iconRender={(visible) =>
                visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              className="mt-2 bg-indigo-600 hover:bg-indigo-500"
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <div className="mt-10 text-center text-sm text-gray-500">
          Don't have an account yet?{" "}
          <Link
            to="/auth/signup"
            className="font-semibold text-indigo-600 hover:text-indigo-500"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
