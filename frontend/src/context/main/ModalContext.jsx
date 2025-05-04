import React, { createContext, useContext, useState } from "react";

// Create the context
const ModalContext = createContext();

// Create a provider component
export const ModalProvider = ({ children }) => {
  // Initialize with default values to prevent undefined errors
  const [modalState, setModalState] = useState({
    toggle: false,
    id: null,
  });

  const setToggle = (id, state) => {
    setModalState({
      toggle: state,
      id: id,
    });
  };

  return (
    <ModalContext.Provider value={{ modalState, setToggle }}>
      {children}
    </ModalContext.Provider>
  );
};

// Create a custom hook to use the context
export const useModalContext = () => {
  const context = useContext(ModalContext);

  if (!context) {
    throw new Error("useModalContext must be used within a ModalProvider");
  }

  return context;
};

// For backwards compatibility if you have code using useModal
export const useModal = useModalContext;
