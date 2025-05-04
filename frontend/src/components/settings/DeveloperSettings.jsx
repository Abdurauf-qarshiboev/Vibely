import React, { useState, useEffect } from "react";
import { Switch, Card, Typography } from "antd";

const { Title, Text } = Typography;

export default function DeveloperSettings() {
  const [debugMode, setDebugMode] = useState(false);

  // Load initial state
  useEffect(() => {
    setDebugMode(localStorage.getItem("debug_mode") === "true");
  }, []);

  // Update debug mode
  const toggleDebugMode = (checked) => {
    localStorage.setItem("debug_mode", checked);
    setDebugMode(checked);
  };

  return (
    <Card className="mb-4">
      <Title level={4}>Developer Settings</Title>
      <div className="flex items-center justify-between my-4">
        <div>
          <Text strong>Debug Mode</Text>
          <Text className="block text-sm text-gray-500">
            Enables detailed console logging for troubleshooting
          </Text>
        </div>
        <Switch checked={debugMode} onChange={toggleDebugMode} />
      </div>
    </Card>
  );
}
