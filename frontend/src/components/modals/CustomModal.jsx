import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/context/ThemeContext";

const CustomModal = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  width = "md",
  okText = "OK",
  cancelText = "Cancel",
  onOk,
  okButtonProps = {},
  cancelButtonProps = {},
  closeIcon = true,
  maskClosable = true,
  centered = false,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const widthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    full: "max-w-full",
  };

  const handleBackdropClick = (e) => {
    if (!maskClosable) {
      e.stopPropagation();
    }
  };

  const handleOk = (e) => {
    if (onOk) {
      onOk(e);
    }
  };

  // Check if okButtonProps has a danger flag
  const isDanger = okButtonProps.danger;

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={maskClosable ? onClose : () => {}}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-40" />
        </Transition.Child>

        <div
          className={`fixed inset-0 overflow-y-auto ${
            centered ? "flex items-center" : ""
          }`}
          onClick={handleBackdropClick}
        >
          <div
            className={`flex min-h-full text-center ${
              centered
                ? "items-center justify-center p-4"
                : "items-end sm:items-center justify-center p-4"
            }`}
          >
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className={`w-full ${
                  widthClasses[width]
                } transform overflow-hidden rounded-lg text-left align-middle shadow-xl transition-all ${
                  isDark ? "bg-black ring-1 ring-inset ring-white/20 text-white" : "bg-white text-gray-900"
                }`}
              >
                {/* Modal header */}
                {title && (
                  <div
                    className={`flex justify-between items-center px-3 py-3 border-b ${
                      isDark ? "border-white/20" : "border-gray-200"
                    }`}
                  >
                    <Dialog.Title className="text-lg font-medium">
                      {title}
                    </Dialog.Title>
                    {closeIcon && (
                      <button
                        type="button"
                        onClick={onClose}
                        className={`rounded-md text-gray-500 hover:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                          isDark
                            ? "focus:ring-blue-500 focus:ring-offset-gray-900"
                            : "focus:ring-blue-500 focus:ring-offset-white"
                        }`}
                      >
                        <span className="sr-only">Close</span>
                        <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                )}

                {/* Modal content */}
                <div className="px-6 py-4">{children}</div>

                {/* Modal footer */}
                {footer !== null && (
                  <div
                    className={`flex justify-end px-6 py-3 border-t gap-3 ${
                      isDark ? "border-white/20" : "border-gray-200"
                    }`}
                  >
                    {footer !== undefined ? (
                      footer
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={onClose}
                          className={`px-4 py-2 text-sm font-medium rounded-md ${
                            isDark
                              ? "bg-white/20 text-gray-200 hover:bg-white/30 focus:ring-offset-gray-900"
                              : "bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-offset-white"
                          } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
                          {...cancelButtonProps}
                        >
                          {cancelText}
                        </button>
                        <button
                          type="button"
                          onClick={handleOk}
                          className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                            isDanger
                              ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
                              : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
                          } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                            isDark
                              ? "focus:ring-offset-gray-900"
                              : "focus:ring-offset-white"
                          }`}
                          {...okButtonProps}
                        >
                          {okText}
                        </button>
                      </>
                    )}
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default CustomModal;
