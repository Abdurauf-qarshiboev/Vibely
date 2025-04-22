import React, { createContext, useContext, useState } from "react";

const SearchDrawerContext = createContext();

export const SearchDrawerProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Users");
  const [searchQuery, setSearchQuery] = useState("");

  // Function to open the drawer
  const openSearchDrawer = () => setIsOpen(true);

  // Function to close the drawer
  const closeSearchDrawer = () => setIsOpen(false);

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
