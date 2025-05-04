import React, { useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Button, Input, message } from "antd";
import { api } from "../../helpers/api";
import { useTheme } from "@/context/ThemeContext";

const { TextArea } = Input;

const ReportProblemModal = ({ isOpen, onClose }) => {
  const [reportText, setReportText] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const handleSubmit = async () => {
    if (!reportText.trim()) {
      message.warning("Please describe the problem before submitting");
      return;
    }

    setLoading(true);
    try {
      const response = await api.post("users/report", {
        message: reportText.trim(),
      });

      if (response.data && response.data.success) {
        message.success("Your report has been submitted successfully");
        setReportText("");
        onClose();
      } else {
        message.error(response.data?.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      message.error(
        error.response?.data?.message ||
          "An error occurred while submitting your report"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={onClose}
        data-theme={theme}
      >
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full max-w-md transform overflow-hidden rounded-lg p-6 text-left align-middle shadow-xl transition-all ${
                  isDark ? "bg-gray-900 text-white" : "bg-white text-gray-900"
                }`}
              >
                <Dialog.Title
                  as="div"
                  className="flex items-center justify-between mb-5"
                >
                  <h3 className="text-lg font-semibold">Report a Problem</h3>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </Dialog.Title>

                <div className="mt-4">
                  <div className="mb-4">
                    <label
                      htmlFor="report-problem"
                      className={`block text-sm font-medium mb-2 ${
                        isDark ? "text-gray-200" : "text-gray-700"
                      }`}
                    >
                      Describe the issue you're experiencing
                    </label>
                    <TextArea
                      id="report-problem"
                      placeholder="Please provide details about the issue..."
                      rows={5}
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      className={
                        isDark ? "bg-gray-800 border-gray-700 text-white" : ""
                      }
                      maxLength={500}
                      showCount
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <Button
                    onClick={onClose}
                    className={isDark ? "text-white hover:text-gray-300" : ""}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="primary"
                    loading={loading}
                    onClick={handleSubmit}
                    className="bg-blue-600 hover:bg-blue-500"
                  >
                    Submit Report
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ReportProblemModal;
