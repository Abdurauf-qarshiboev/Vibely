/* eslint-disable no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  Form,
  Input,
  Button,
  Progress,
  Space,
  Tooltip,
  Typography,
  message,
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
  CameraOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { api } from "../../helpers/api";

const { Text } = Typography;

export default function SignupPage() {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [passwordValue, setPasswordValue] = useState("");
  const [validationChecks, setValidationChecks] = useState({
    hasNumber: false,
    hasLowercase: false,
    hasUppercase: false,
    hasMinLength: false,
  });
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const { signup } = useAuth();

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

  // Clean up preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

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

  // Handle avatar change
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        message.error("Avatar image must be less than 5MB");
        return;
      }

      if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
        message.error("Only JPEG, JPG and PNG images are allowed");
        return;
      }

      setAvatar(file);

      // Clean up previous preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }

      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Trigger file input click
  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Remove avatar
  const removeAvatar = () => {
    setAvatar(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

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
      // Create user data object
      const userData = {
        username: values.username,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        phone: values.phone,
        bio: values.bio || "",
      };

      // Create FormData object
      const formData = new FormData();

      // Add user data as JSON string
      formData.append("request", JSON.stringify(userData));

      // Add avatar if selected
      if (avatar) {
        formData.append("avatar", avatar);
      }

      console.log("Signing up with:", userData);

      const { data } = await api.post("auth/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Signup response:", data);

      if (data?.error) {
        message.warning(data.error?.message || "Registration failed");
      } else {
        message.success(
          "Successfully registered. You can now login with your credentials."
        );
        navigate("/auth/login");
      }
    } catch (error) {
      console.error("Signup error:", error);
      message.error(
        error?.response?.data?.message ||
          error?.response?.data?.error?.message ||
          "Registration failed! Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full w-full py-8 px-4 sm:px-6 bg-gray-50 text-gray-900">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Sign up</h1>
          <p className="mt-2 text-gray-600">Create an account to get started</p>
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
          {/* Main Content */}
          <div className="space-y-6">
            {/* Avatar Upload */}
            <div className="p-6 rounded-lg bg-white shadow border border-1 border-gray-100 flex flex-col items-center">
              <h2 className="text-lg font-medium mb-4 text-gray-900">
                Profile Photo
              </h2>

              <div className="relative  mb-4">
                <div
                  className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200 flex items-center justify-center cursor-pointer"
                  onClick={triggerFileInput}
                >
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Avatar preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <CameraOutlined
                      style={{ fontSize: "2rem", color: "#bfbfbf" }}
                    />
                  )}

                  <input
                    id="avatarinput"
                    type="file"
                    ref={fileInputRef}
                    onChange={handleAvatarChange}
                    className="hidden bg-transparent"
                    accept="image/png, image/jpeg, image/jpg"
                  />
                </div>

                {previewUrl && (
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="size-6 grid place-content-center absolute right-0 -top-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    <DeleteOutlined style={{ fontSize: "14px" }} />
                  </button>
                )}
              </div>

              <div className="text-center text-sm text-gray-500">
                {!previewUrl ? (
                  <span>Click to upload a profile photo (optional)</span>
                ) : (
                  <span>Click to change your profile photo</span>
                )}
              </div>
            </div>

            {/* Account Details */}
            <div className="p-6 rounded-lg bg-white shadow border border-1 border-gray-100">
              <h2 className="text-lg font-medium mb-4 text-gray-900">
                Account Details
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Username Field */}
                <Form.Item
                  name="username"
                  label={<span>Username</span>}
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
                      <UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />
                    }
                    placeholder="e.g. johndoe"
                  />
                </Form.Item>

                {/* Password Field */}
                <Form.Item
                  name="password"
                  label={<span>Password</span>}
                  rules={[
                    { required: true, message: "Please enter your password" },
                  ]}
                >
                  <Input.Password
                    autoComplete="current-password"
                    prefix={
                      <LockOutlined style={{ color: "rgba(0,0,0,.25)" }} />
                    }
                    placeholder="Create a strong password"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                    onChange={(e) => setPasswordValue(e.target.value)}
                  />
                </Form.Item>
              </div>

              {/* Password Strength Indicator */}
              {passwordValue && (
                <div className="mt-3">
                  <div className="flex justify-between items-center mb-2">
                    <Text className="text-gray-700">Password Strength</Text>
                    <Text
                      className={
                        getPasswordStrength() === 100
                          ? "text-green-500"
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
                    <Text className="flex items-center text-xs text-gray-700">
                      {validationChecks.hasMinLength ? (
                        <CheckCircleFilled className="text-green-500 mr-2" />
                      ) : (
                        <CloseCircleFilled className="text-red-500 mr-2" />
                      )}
                      At least 8 characters
                    </Text>

                    <Text className="flex items-center text-xs text-gray-700">
                      {validationChecks.hasNumber ? (
                        <CheckCircleFilled className="text-green-500 mr-2" />
                      ) : (
                        <CloseCircleFilled className="text-red-500 mr-2" />
                      )}
                      At least one number
                    </Text>

                    <Text className="flex items-center text-xs text-gray-700">
                      {validationChecks.hasLowercase ? (
                        <CheckCircleFilled className="text-green-500 mr-2" />
                      ) : (
                        <CloseCircleFilled className="text-red-500 mr-2" />
                      )}
                      At least one lowercase letter
                    </Text>

                    <Text className="flex items-center text-xs text-gray-700">
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
            <div className="p-6 rounded-lg bg-white shadow border border-1 border-gray-100">
              <h2 className="text-lg font-medium mb-4 text-gray-900">
                Personal Information
              </h2>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* First Name Field */}
                <Form.Item
                  name="firstName"
                  label={<span>First Name</span>}
                  rules={[
                    {
                      required: true,
                      message: "Please enter your first name",
                    },
                  ]}
                >
                  <Input
                    className="rounded border-[#d9d9d9]"
                    placeholder="John"
                  />
                </Form.Item>

                {/* Last Name Field */}
                <Form.Item
                  name="lastName"
                  label={<span>Last Name</span>}
                  rules={[
                    {
                      required: true,
                      message: "Please enter your last name",
                    },
                  ]}
                >
                  <Input
                    prefix={""}
                    className="rounded border-[#d9d9d9]"
                    placeholder="Doe"
                  />
                </Form.Item>

                {/* Email Field */}
                <Form.Item
                  name="email"
                  label={<span>Email Address</span>}
                  rules={[
                    { required: true, message: "Please enter your email" },
                    { type: "email", message: "Please enter a valid email" },
                  ]}
                >
                  <Input
                    prefix={
                      <MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />
                    }
                    placeholder="john@example.com"
                  />
                </Form.Item>

                {/* Phone Field */}
                <Form.Item
                  name="phone"
                  label={<span>Phone Number</span>}
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
                      <PhoneOutlined style={{ color: "rgba(0,0,0,.25)" }} />
                    }
                    placeholder="+998931234567"
                  />
                </Form.Item>
              </div>

              {/* Bio Field */}
              <Form.Item
                name="bio"
                label={
                  <span>
                    Bio
                    <Tooltip title="Share a little about yourself">
                      <InfoCircleOutlined className="ml-1 text-gray-500" />
                    </Tooltip>
                  </span>
                }
              >
                <Input.TextArea
                  placeholder="Tell us about yourself (optional)"
                  rows={3}
                  showCount
                  maxLength={100}
                />
              </Form.Item>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex flex-col items-center justify-center py-4">
            <Form.Item className="mb-2 w-full sm:w-auto">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
                className="px-8 h-10 w-full sm:w-auto bg-indigo-600 "
              >
                Sign up
              </Button>
            </Form.Item>

            <div className="mt-4 text-center text-gray-500">
              Already have an account?{" "}
              <Link
                to="/auth/login"
                className="font-semibold text-indigo-600 hover:text-indigo-500"
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
