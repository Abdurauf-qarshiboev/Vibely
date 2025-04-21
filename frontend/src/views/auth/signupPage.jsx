import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import './style/Auth.css'
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Progress,
  Space,
  Tooltip,
  Typography,
} from "antd";
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  LockOutlined,
  InfoCircleOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  CheckCircleFilled,
  CloseCircleFilled,
  PlusOutlined,
  SunOutlined,
  MoonOutlined,
} from "@ant-design/icons";

const { Text } = Typography;

export default function SignupPage() {
  const [form] = Form.useForm();
  const [passwordValue, setPasswordValue] = useState("");
  const [validationChecks, setValidationChecks] = useState({
    hasNumber: false,
    hasLowercase: false,
    hasUppercase: false,
    hasMinLength: false,
  });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";
  const navigate = useNavigate();

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

  // Handle avatar upload
  const handleAvatarChange = ({ fileList }) => {
    if (fileList.length > 0) {
      const file = fileList[0].originFileObj;
      setAvatarFile(file);

      // Create a preview URL
      const objectUrl = URL.createObjectURL(file);
      setAvatarUrl(objectUrl);

      // Return false to prevent antd's default upload
      return false;
    }
  };

  // Custom avatar upload button
  const uploadButton = (
    <div>
      <PlusOutlined className={isDark ? "text-white" : "text-gray-800"} />
      <div className={isDark ? "text-white mt-2" : "text-gray-800 mt-2"}>
        Upload
      </div>
    </div>
  );

  // Handle form submission
  const handleSubmit = async (values) => {
    // Check password requirements
    const { hasNumber, hasLowercase, hasUppercase, hasMinLength } =
      validationChecks;
    const allRequirementsMet =
      hasNumber && hasLowercase && hasUppercase && hasMinLength;

    if (!allRequirementsMet) {
      message.error("Please make sure your password meets all requirements");
      return;
    }

    setLoading(true);

    try {
      // Create form data to handle file upload
      const formData = new FormData();

      // Add all user info to form data
      Object.keys(values).forEach((key) => {
        if (key !== "avatar") {
          formData.append(key, values[key]);
        }
      });

      // Add avatar file if exists
      if (avatarFile) {
        formData.append("avatar", avatarFile);
      }

      // Call signup method from Auth context
      await signup(formData);

      // Clean up avatar URL
      if (avatarUrl) {
        URL.revokeObjectURL(avatarUrl);
      }

      message.success("Sign up successful! Please log in.");
      navigate("/auth/login");
    } catch (error) {
      console.error("Signup failed:", error);
      const errorMsg =
        error.response?.data?.message || "Sign up failed. Please try again.";
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Common input class for consistent styling
  const inputClass = isDark
    ? "bg-gray-800 text-white border-gray-700 hover:border-blue-400 focus:border-blue-400"
    : "";

  return (
    <div
      className={`h-full w-full py-8 px-4 sm:px-6 transition-colors duration-200 ${
        isDark ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Theme Toggle Button */}
      <div className="absolute top-4 right-4">
        <Button
          type="text"
          icon={isDark ? <SunOutlined /> : <MoonOutlined />}
          onClick={toggleTheme}
          className={`rounded-full flex items-center justify-center ${
            isDark
              ? "bg-gray-800 text-yellow-400 hover:bg-gray-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
          size="large"
        />
      </div>

      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1
            className={`text-3xl font-bold ${
              isDark ? "text-white" : "text-gray-900"
            }`}
          >
            Sign up
          </h1>
          <p className={`mt-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            This information will be displayed publicly so be careful what you
            share.
          </p>
        </div>

        <Form
          form={form}
          layout="vertical"
          name="signup"
          onFinish={handleSubmit}
          requiredMark={false}
          className="space-y-6"
          initialValues={{
            bio: "",
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Avatar Upload Section */}
            <div
              className={`p-6 rounded-lg transition-colors duration-200 ${
                isDark ? "bg-gray-800" : "bg-white"
              } shadow`}
            >
              <h2
                className={`text-lg font-medium mb-4 text-center ${
                  isDark ? "text-white" : "text-gray-900"
                }`}
              >
                Profile Picture
              </h2>

              <div className="flex items-center justify-center">
                <div className="text-center">
                  <Form.Item name="avatar" className="mb-0">
                      <Upload
                        name="avatar"
                        listType="picture-circle"
                        showUploadList={false}
                        beforeUpload={() => false}
                        onChange={handleAvatarChange}
                        className={`avatar-uploader ${
                          isDark ? "dark-mode-upload" : ""
                        }`}
                      >
                        {avatarUrl ? (
                          <div className="w-full h-full overflow-hidden rounded-full">
                            <img
                              src={avatarUrl}
                              alt="Avatar"
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          uploadButton
                        )}
                      </Upload>
                  </Form.Item>
                  <p
                    className={`mt-4 text-sm ${
                      isDark ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    Click to upload profile picture
                  </p>
                </div>
              </div>
            </div>

            {/* Account and Personal Info Sections */}
            <div className="lg:col-span-2 space-y-6">
              {/* Account Details */}
              <div
                className={`p-6 rounded-lg transition-colors duration-200 ${
                  isDark ? "bg-gray-800" : "bg-white"
                } shadow`}
              >
                <h2
                  className={`text-lg font-medium mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Account Details
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* Username Field */}
                  <Form.Item
                    name="username"
                    label={
                      <span className={isDark ? "text-white" : ""}>
                        Username
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please enter your username" },
                      {
                        min: 3,
                        message: "Username must be at least 3 characters",
                      },
                    ]}
                  >
                    <Input
                      prefix={
                        <UserOutlined
                          style={{
                            color: isDark
                              ? "rgba(255,255,255,.45)"
                              : "rgba(0,0,0,.25)",
                          }}
                        />
                      }
                      placeholder="e.g. johndoe"
                      className={inputClass}
                    />
                  </Form.Item>

                  {/* Password Field */}
                  <Form.Item
                    name="password"
                    label={
                      <span className={isDark ? "text-white" : ""}>
                        Password
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please enter your password" },
                    ]}
                  >
                    <Input.Password
                      prefix={
                        <LockOutlined
                          style={{
                            color: isDark
                              ? "rgba(255,255,255,.45)"
                              : "rgba(0,0,0,.25)",
                          }}
                        />
                      }
                      placeholder="Create a strong password"
                      className={inputClass}
                      iconRender={(visible) =>
                        visible ? (
                          <EyeTwoTone
                            twoToneColor={isDark ? "#177ddc" : undefined}
                          />
                        ) : (
                          <EyeInvisibleOutlined
                            style={{
                              color: isDark
                                ? "rgba(255,255,255,.45)"
                                : undefined,
                            }}
                          />
                        )
                      }
                      onChange={(e) => setPasswordValue(e.target.value)}
                      value={passwordValue}
                    />
                  </Form.Item>
                </div>

                {/* Password Strength Indicator */}
                {passwordValue && (
                  <div className="mt-2">
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
                      strokeColor={getPasswordStrengthColor(
                        getPasswordStrength()
                      )}
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
              </div>

              {/* Personal Information */}
              <div
                className={`p-6 rounded-lg transition-colors duration-200 ${
                  isDark ? "bg-gray-800" : "bg-white"
                } shadow`}
              >
                <h2
                  className={`text-lg font-medium mb-4 ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                >
                  Personal Information
                </h2>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {/* First Name Field */}
                  <Form.Item
                    name="firstName"
                    label={
                      <span className={isDark ? "text-white" : ""}>
                        First Name
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter your first name",
                      },
                    ]}
                  >
                    <Input placeholder="John" className={inputClass} />
                  </Form.Item>

                  {/* Last Name Field */}
                  <Form.Item
                    name="lastName"
                    label={
                      <span className={isDark ? "text-white" : ""}>
                        Last Name
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter your last name",
                      },
                    ]}
                  >
                    <Input placeholder="Doe" className={inputClass} />
                  </Form.Item>

                  {/* Email Field */}
                  <Form.Item
                    name="email"
                    label={
                      <span className={isDark ? "text-white" : ""}>
                        Email Address
                      </span>
                    }
                    rules={[
                      { required: true, message: "Please enter your email" },
                      { type: "email", message: "Please enter a valid email" },
                    ]}
                  >
                    <Input
                      prefix={
                        <MailOutlined
                          style={{
                            color: isDark
                              ? "rgba(255,255,255,.45)"
                              : "rgba(0,0,0,.25)",
                          }}
                        />
                      }
                      placeholder="john@example.com"
                      className={inputClass}
                    />
                  </Form.Item>

                  {/* Phone Field */}
                  <Form.Item
                    name="phone"
                    label={
                      <span className={isDark ? "text-white" : ""}>
                        Phone Number
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Please enter your phone number",
                      },
                      {
                        pattern: /^\+?[0-9\s\-()]+$/,
                        message: "Please enter a valid phone number",
                      },
                    ]}
                  >
                    <Input
                      prefix={
                        <PhoneOutlined
                          style={{
                            color: isDark
                              ? "rgba(255,255,255,.45)"
                              : "rgba(0,0,0,.25)",
                          }}
                        />
                      }
                      placeholder="+998931234567"
                      className={inputClass}
                    />
                  </Form.Item>
                </div>

                {/* Bio Field */}
                <Form.Item
                  name="bio"
                  label={
                    <span className={isDark ? "text-white" : ""}>
                      Bio
                      <Tooltip title="Share a little about yourself">
                        <InfoCircleOutlined
                          className={`ml-1 ${
                            isDark ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                      </Tooltip>
                    </span>
                  }
                >
                  <Input.TextArea
                    placeholder="Tell us about yourself (optional)"
                    rows={4}
                    showCount
                    maxLength={200}
                    className={inputClass}
                  />
                </Form.Item>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-center justify-center pt-4">
            <Form.Item className="mb-2 w-full sm:w-auto">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className={`px-8 h-10 w-full sm:w-auto ${
                  isDark
                    ? "bg-indigo-500 hover:bg-indigo-400 border-indigo-500"
                    : "bg-indigo-600 hover:bg-indigo-500 border-indigo-600"
                }`}
              >
                Sign up
              </Button>
            </Form.Item>

            <div
              className={`mt-4 text-center ${
                isDark ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className={`font-semibold ${
                  isDark
                    ? "text-indigo-400 hover:text-indigo-300"
                    : "text-indigo-600 hover:text-indigo-500"
                }`}
              >
                Log in
              </Link>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
