import { createContext, useState, useContext } from "react";

const ModalContext = createContext();

export function ModalProvider({ children }) {
  const [toggle, setToggle] = useState(false);
  const [id, setId] = useState(null);
  const [searchToggle, setSearchToggleState] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const setToggleModal = (blogId, state) => {
    setId(blogId);
    setToggle(state);
  };

  const closeModal = () => {
    setToggle(false);
    setId(null);
  };

  const setSearchToggle = (state, query = "") => {
    setSearchToggleState(state);
    setSearchQuery(query);
  };

  const handleHashtagClick = (event) => {
    const target = event.target;
    if (target.tagName === "A" && target.classList.contains("hashtag-link")) {
      const hashtag = target.textContent;
      setSearchToggle(true, hashtag);
      console.log("Searching for:", hashtag);
    }
  };

  return (
    <ModalContext.Provider
      value={{
        toggle,
        id,
        searchToggle,
        searchQuery,
        setToggle: setToggleModal,
        closeModal,
        setSearchToggle,
        handleHashtagClick,
      }}
    >
      {children}
    </ModalContext.Provider>
  );
}

export const useModalContext = () => useContext(ModalContext);
