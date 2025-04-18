import { createContext, useState, useContext, useCallback } from "react";
import { api, URL } from "@/helpers/api";

const HashtagsContext = createContext();

export function HashtagsProvider({ children }) {
  const [hashtags, setHashtags] = useState([]);

  const allHashtags = useCallback(async () => {
    try {
      const { data } = await api.get(`${URL}/hashtag/all`);
      setHashtags(data.hashtags);
      return data.hashtags;
    } catch (err) {
      console.error("Error fetching hashtags:", err);
      return [];
    }
  }, []);

  const checkAndCreateHashtags = useCallback(
    async (text) => {
      try {
        // Extract hashtags from text using regex
        const hashtagRegex = /#(\w+)/g;
        const matches = text.match(hashtagRegex) || [];
        const extractedHashtags = matches.map((tag) => tag.substring(1));

        if (extractedHashtags.length === 0) {
          return { allHashtags: [] };
        }

        // Check which hashtags already exist and which need to be created
        const existingHashtags = await allHashtags();
        const existingHashtagNames = existingHashtags.map((h) => h.name);

        const newHashtags = extractedHashtags.filter(
          (tag) => !existingHashtagNames.includes(tag)
        );

        // Create new hashtags if needed
        for (const tag of newHashtags) {
          await api.post(`${URL}/hashtag/create`, { name: tag });
        }

        // Refresh hashtags
        const updatedHashtags = await allHashtags();
        return { allHashtags: updatedHashtags };
      } catch (err) {
        console.error("Error checking and creating hashtags:", err);
        return { allHashtags: [] };
      }
    },
    [allHashtags]
  );

  const processedText = useCallback((text) => {
    if (!text) return "";

    // Replace hashtags with links
    return text.replace(
      /#(\w+)/g,
      '<a href="#" class="hashtag-link text-blue-600">#$1</a>'
    );
  }, []);

  return (
    <HashtagsContext.Provider
      value={{
        hashtags,
        allHashtags,
        checkAndCreateHashtags,
        processedText,
      }}
    >
      {children}
    </HashtagsContext.Provider>
  );
}

export const useHashtagsContext = () => useContext(HashtagsContext);
