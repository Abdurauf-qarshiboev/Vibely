import { createContext, useState, useContext, useCallback } from "react";
import { api, URL } from "@/helpers/api";
import { message } from "antd";
import { useBlogs } from "./BlogsContext";

const CommentsContext = createContext();

export function CommentsProvider({ children }) {
  const { allBlogs } = useBlogs();
  const [commentDrafts, setCommentDrafts] = useState({});

  const getCommentDraft = useCallback(
    (blogId) => {
      return commentDrafts[blogId] || "";
    },
    [commentDrafts]
  );

  const updateCommentDraft = useCallback((blogId, text) => {
    setCommentDrafts((prev) => ({
      ...prev,
      [blogId]: text,
    }));
  }, []);

  const submitComment = useCallback(
    async (blogId, userId) => {
      try {
        const commentText = getCommentDraft(blogId);
        if (!commentText.trim()) {
          message.error("Izoh matnini kiriting!");
          return;
        }

        await api.post(`${URL}/comment`, {
          blogId,
          userId,
          text: commentText,
        });

        // Clear the comment draft
        updateCommentDraft(blogId, "");

        // Refresh blogs to get updated comments
        await allBlogs();

        message.success("Izoh muvaffaqiyatli qo'shildi!");
      } catch (err) {
        console.error("Error submitting comment:", err);
        message.error("Izohni saqlashda xatolik yuz berdi!");
      }
    },
    [getCommentDraft, updateCommentDraft, allBlogs]
  );

  const getComment = useCallback(async (commentId) => {
    try {
      const { data } = await api.get(`${URL}/comment/${commentId}`);
      return data;
    } catch (err) {
      console.error("Error getting comment:", err);
      return null;
    }
  }, []);

  const editComment = useCallback(
    async (commentId, blogId) => {
      try {
        const commentText = getCommentDraft(blogId);
        if (!commentText.trim()) {
          message.error("Izoh matnini kiriting!");
          return;
        }

        await api.put(`${URL}/comment`, {
          _id: commentId,
          text: commentText,
        });

        // Clear the comment draft
        updateCommentDraft(blogId, "");

        // Refresh blogs to get updated comments
        await allBlogs();

        message.success("Izoh muvaffaqiyatli yangilandi!");
      } catch (err) {
        console.error("Error editing comment:", err);
        message.error("Izohni yangilashda xatolik yuz berdi!");
      }
    },
    [getCommentDraft, updateCommentDraft, allBlogs]
  );

  const removeComments = useCallback(
    async (commentId) => {
      try {
        await api.delete(`${URL}/comment/${commentId}`);

        // Refresh blogs to get updated comments
        await allBlogs();

        message.success("Izoh muvaffaqiyatli o'chirildi!");
      } catch (err) {
        console.error("Error removing comment:", err);
        message.error("Izohni o'chirishda xatolik yuz berdi!");
      }
    },
    [allBlogs]
  );

  return (
    <CommentsContext.Provider
      value={{
        getCommentDraft,
        updateCommentDraft,
        submitComment,
        getComment,
        editComment,
        removeComments,
      }}
    >
      {children}
    </CommentsContext.Provider>
  );
}

export const useCommentsContext = () => useContext(CommentsContext);
