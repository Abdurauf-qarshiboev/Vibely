import React from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/context/ThemeContext";

const SettingsOptionsModal = ({ isOpen, closeModal, onOptionSelect }) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const options = [
    { id: "verify", label: "Get Verified" },
    { id: "password", label: "Update Password" },
    { id: "logout", label: "Logout" },
  ];

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog as="div" className="relative z-50" onClose={closeModal}>
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
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
                className={`w-full max-w-md transform overflow-hidden rounded-2xl p-6 text-left align-middle shadow-xl transition-all ${
                  isDark ? "bg-gray-900" : "bg-white"
                }`}
              >
                <div className="flex justify-between items-center mb-4">
                  <Dialog.Title
                    as="h3"
                    className={`text-lg font-medium leading-6 ${
                      isDark ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Settings
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md text-red-400 hover:text-red-500 focus:outline-none"
                    onClick={closeModal}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>
                <div className="mt-2 space-y-2">
                  {options.map((option) => (
                    <button
                      key={option.id}
                      className={`w-full text-left py-3 px-4 rounded-md transition ${
                        isDark
                          ? "hover:bg-gray-800 text-white"
                          : "hover:bg-gray-100 text-gray-900"
                      }`}
                      onClick={() => onOptionSelect(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SettingsOptionsModal;
