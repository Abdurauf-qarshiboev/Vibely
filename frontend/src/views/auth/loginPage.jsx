import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
  Input,
  Tooltip,
  Button,
  Form,
  Progress,
  Space,
  Typography,
  message,
} from "antd";
import {
  UserOutlined,
  InfoCircleOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
  SunOutlined,
  MoonOutlined,
  LockOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
} from "@ant-design/icons";

const { Text } = Typography;

export default function LoginPage() {
  const [form] = Form.useForm();
  const [passwordValue, setPasswordValue] = useState("");
  const [validationChecks, setValidationChecks] = useState({
    hasNumber: false,
    hasLowercase: false,
    hasUppercase: false,
    hasMinLength: false,
  });
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  // Validate password as user types
  useEffect(() => {
    if (passwordValue) {
      const checks = {
        hasNumber: /[0-9]/.test(passwordValue),
        hasLowercase: /[a-z]/.test(passwordValue),
        hasUppercase: /[A-Z]/.test(passwordValue),
        hasMinLength: passwordValue.length >= 8,
      };
      setValidationChecks(checks);
    } else {
      setValidationChecks({
        hasNumber: false,
        hasLowercase: false,
        hasUppercase: false,
        hasMinLength: false,
      });
    }
  }, [passwordValue]);

  // Calculate password strength
  const getPasswordStrength = () => {
    const { hasNumber, hasLowercase, hasUppercase, hasMinLength } =
      validationChecks;
    const criteria = [hasNumber, hasLowercase, hasUppercase, hasMinLength];
    const passedCriteria = criteria.filter(Boolean).length;

    // Return percentage based on passed criteria
    return (passedCriteria / criteria.length) * 100;
  };

  // Get color for password strength bar
  const getPasswordStrengthColor = (strength) => {
    if (strength < 50) return "#ff4d4f";
    if (strength < 100) return "#faad14";
    return "#52c41a";
  };

  // Handle form submission
  const handleSubmit = async (values) => {
    try {
      // Check password requirements before submitting
      const { hasNumber, hasLowercase, hasUppercase, hasMinLength } =
        validationChecks;
      const allRequirementsMet =
        hasNumber && hasLowercase && hasUppercase && hasMinLength;

      if (!allRequirementsMet) {
        message.error("Please make sure your password meets all requirements");
        return;
      }

      await login(values);
    } catch (error) {
      console.error("Login failed:", error);
      message.error(
        error.response?.data?.message || "Login failed. Please try again."
      );
    }
  };

  return (
    <div
      className={`min-h-screen w-full flex flex-col justify-start px-6 py-12 lg:px-8 ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4">
        <Button
          type="text"
          icon={isDark ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          className={`rounded-full ${
            isDark ? "text-yellow-400" : "text-gray-700"
          }`}
          size="large"
        />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <h2
          className={`mt-10 text-center text-3xl font-bold leading-9 tracking-tight ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
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
            label={
              <span className={isDark ? "text-white" : "text-gray-900"}>
                Username
              </span>
            }
          >
            <Input
              prefix={
                <UserOutlined
                  style={{
                    color: isDark ? "rgba(255,255,255,.45)" : "rgba(0,0,0,.25)",
                  }}
                />
              }
              placeholder="Enter your username"
              className={isDark ? "bg-gray-800 text-white border-gray-700 " : ""}
              suffix={
                <Tooltip title="Your unique username for login">
                  <InfoCircleOutlined
                    style={{
                      color: isDark
                        ? "rgba(255,255,255,.45)"
                        : "rgba(0,0,0,.45)",
                    }}
                  />
                </Tooltip>
              }
            />
          </Form.Item>

          {/* Password Field */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Please enter your password" }]}
            label={
              <div className="flex justify-between w-full">
                <span className={isDark ? "text-white" : "text-gray-900"}>
                  Password
                </span>
                <Link
                  to="/auth/forgot-password"
                  className={`text-xs ${
                    isDark
                      ? "text-indigo-400 hover:text-indigo-300"
                      : "text-indigo-600 hover:text-indigo-500"
                  }`}
                >
                  Forgot password?
                </Link>
              </div>
            }
          >
            <Input.Password
              prefix={
                <LockOutlined
                  style={{
                    color: isDark ? "rgba(255,255,255,.45)" : "rgba(0,0,0,.25)",
                  }}
                />
              }
              placeholder="Enter your password"
              className={isDark ? "bg-gray-800 text-white border-gray-700" : ""}
              iconRender={(visible) =>
                visible ? (
                  <EyeTwoTone />
                ) : (
                  <EyeInvisibleOutlined
                    style={{
                      color: isDark ? "rgba(255,255,255,.45)" : undefined,
                    }}
                  />
                )
              }
              onChange={(e) => setPasswordValue(e.target.value)}
              value={passwordValue}
            />
          </Form.Item>

          {/* Password Strength Indicator */}
          {passwordValue && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <Text className={isDark ? "text-white" : "text-gray-700"}>
                  Password Strength
                </Text>
                <Text
                  className={
                    getPasswordStrength() === 100
                      ? "text-green-500"
                      : isDark
                      ? "text-gray-400"
                      : "text-gray-500"
                  }
                >
                  {getPasswordStrength() === 100 ? "Strong" : "Weak"}
                </Text>
              </div>

              <Progress
                percent={getPasswordStrength()}
                status="active"
                strokeColor={getPasswordStrengthColor(getPasswordStrength())}
                showInfo={false}
                size="small"
              />

              <Space direction="vertical" className="w-full mt-3">
                <Text
                  className={`flex items-center text-xs ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {validationChecks.hasMinLength ? (
                    <CheckCircleFilled className="text-green-500 mr-2" />
                  ) : (
                    <CloseCircleFilled className="text-red-500 mr-2" />
                  )}
                  At least 8 characters
                </Text>

                <Text
                  className={`flex items-center text-xs ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {validationChecks.hasNumber ? (
                    <CheckCircleFilled className="text-green-500 mr-2" />
                  ) : (
                    <CloseCircleFilled className="text-red-500 mr-2" />
                  )}
                  At least one number
                </Text>

                <Text
                  className={`flex items-center text-xs ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {validationChecks.hasLowercase ? (
                    <CheckCircleFilled className="text-green-500 mr-2" />
                  ) : (
                    <CloseCircleFilled className="text-red-500 mr-2" />
                  )}
                  At least one lowercase letter
                </Text>

                <Text
                  className={`flex items-center text-xs ${
                    isDark ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  {validationChecks.hasUppercase ? (
                    <CheckCircleFilled className="text-green-500 mr-2" />
                  ) : (
                    <CloseCircleFilled className="text-red-500 mr-2" />
                  )}
                  At least one uppercase letter
                </Text>
              </Space>
            </div>
          )}

          {/* Submit Button */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              className={`mt-2 ${
                isDark
                  ? "bg-indigo-500 hover:bg-indigo-400"
                  : "bg-indigo-600 hover:bg-indigo-500"
              }`}
            >
              Sign in
            </Button>
          </Form.Item>
        </Form>

        <div
          className={`mt-10 text-center text-sm ${
            isDark ? "text-gray-400" : "text-gray-500"
          }`}
        >
          Don't have an account yet?{" "}
          <Link
            to="/auth/signup"
            className={`font-semibold ${
              isDark
                ? "text-indigo-400 hover:text-indigo-300"
                : "text-indigo-600 hover:text-indigo-500"
            }`}
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
