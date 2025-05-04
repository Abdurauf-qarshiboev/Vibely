/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const SearchDrawerContext = createContext();

export const SearchDrawerProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Users");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Function to open the drawer
  const openSearchDrawer = () => setIsOpen(true);

  // Function to close the drawer
  const closeSearchDrawer = () => {
    setIsOpen(false);
  };

  // Wrapper for setSearchQuery that ensures string values
  const handleSetSearchQuery = (query) => {
    // Ensure we're setting a string
    if (query !== null && query !== undefined) {
      console.log(query);

      setSearchQuery(String(query));
    } else {
      setSearchQuery("");
    }
  };

  return (
    <SearchDrawerContext.Provider
      value={{
        isOpen,
        openSearchDrawer,
        closeSearchDrawer,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery: handleSetSearchQuery, // Use the wrapper
      }}
    >
      {children}
    </SearchDrawerContext.Provider>
  );
};

export const useSearchDrawerContext = () => useContext(SearchDrawerContext);

export default SearchDrawerContext;
