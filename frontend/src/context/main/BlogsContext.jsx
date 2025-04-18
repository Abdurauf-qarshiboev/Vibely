import {
  createContext,
  useState,
  useContext,
  useCallback,
  // useEffect,
} from "react";
import { api, URL } from "@/helpers/api";
import { message } from "antd"; // Using Antd for notifications similar to ElMessage

const BlogsContext = createContext();

export function BlogsProvider({ children }) {
  const [blogs, setBlogs] = useState({
    data: [],
    count: 0,
  });

  const [myBlogs, setMyBlogs] = useState({
    data: [],
    count: 0,
  });

  const timeSince = (isoDateString) => {
    if (!isoDateString) return "Invalid date";

    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }

    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    // If the time difference is greater than 6 months (~26 weeks)
    if (seconds > 26 * 7 * 24 * 60 * 60) {
      return formatReadableDate(isoDateString);
    }

    const intervals = [
      { label: "yil", seconds: 365 * 24 * 60 * 60 },
      { label: "oy", seconds: 30 * 24 * 60 * 60 },
      { label: "hafta", seconds: 7 * 24 * 60 * 60 },
      { label: "kun", seconds: 24 * 60 * 60 },
      { label: "soat", seconds: 60 * 60 },
      { label: "minut", seconds: 60 },
      { label: "sekund", seconds: 1 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count > 0) {
        return `${count} ${interval.label} oldin`;
      }
    }
    return "hozir";
  };

  const formatReadableDate = (isoDateString) => {
    if (!isoDateString) return "Invalid date";
    const date = new Date(isoDateString);
    if (isNaN(date.getTime())) {
      return "Invalid date";
    }
    const options = {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour12: false,
    };
    return new Intl.DateTimeFormat("en-US", options)?.format(date);
  };

  const allBlogs = useCallback(async () => {
    try {
      const { data } = await api.get(`/posts/feed`);
      console.log("all blogs:", data);
      setBlogs({
        data: data.blogs,
        count: data.count,
      });
    } catch (err) {
      console.error("Error in allBlogs:", err);
    }
  }, []);

  const myBlogsData = useCallback(async (params) => {
    try {
      const { data } = await api.get(`/posts`, { params });
      setMyBlogs({
        data: data.blogs,
        count: data.count,
      });
      console.log("my blogs:", data);
    } catch (err) {
      console.error("Error in myBlogs:", err);
    }
  }, []);

  const newBlog = useCallback(async (newBlogData) => {
    console.log({ ...newBlogData });
    try {
      const { data } = await api.post(`${URL}/blog/create`, newBlogData);
      setBlogs((prev) => ({
        data: [data, ...prev.data],
        count: prev.count + 1,
      }));
      message.success("Yangi post muvaffaqiyatli qo'shildi!");
    } catch (err) {
      console.error("Error in newBlogs:", err);
      if (err.response?.data?.msg === "Duplicate key error:") {
        message.error("Bunday kodga ega post mavjud!!");
      }
    }
  }, []);

  const getBlogById = useCallback(
    (id) => {
      return blogs.data.find((blog) => blog._id === id);
    },
    [blogs.data]
  );

  const getBlog = useCallback(async (id) => {
    try {
      return await api.get(`${URL}/blog/findone/${id}`);
    } catch (err) {
      console.error(`Error fetching blog with id ${id}:`, err);
    }
  }, []);

  const saveBlog = useCallback(async (update) => {
    console.log(update);
    try {
      const { data } = await api.put(`${URL}/blog`, update);
      setBlogs((prev) => ({
        ...prev,
        data: prev.data.map((item) => (item._id === data._id ? data : item)),
      }));
      message.success("Post muvaffaqiyatli yangilandi!");
    } catch (err) {
      console.error("Error in saveBlogs:", err);
    }
  }, []);

  const statusBlog = useCallback(async (blogId) => {
    try {
      const { data } = await api.get(`${URL}/blog/change/${blogId}`);
      setBlogs((prev) => ({
        ...prev,
        data: prev.data.map((item) => (item._id === data._id ? data : item)),
      }));
      message.success("Post holati yangilandi!");
    } catch (err) {
      console.error(
        `Error with changing the status of the blog with blogID : ${blogId}:`,
        err.response?.data?.message || err.message || err
      );
      message.error("Post holatini yangilashda xatolik yuz berdi!");
    }
  }, []);

  const removeBlog = useCallback(async (id) => {
    try {
      await api.delete(`${URL}/blog/delete/${id}`);
      setBlogs((prev) => ({
        data: prev.data.filter((item) => item._id !== id),
        count: prev.count - 1,
      }));
      message.success("Post muvaffaqiyatli o'chirildi!");
    } catch (err) {
      console.error(`Error removing blog with id ${id}:`, err);
      message.error("Postni o'chirishda muammo yuz berdi!");
    }
  }, []);

  const likeBlog = useCallback(async (blogId, userId) => {
    try {
      const res = await api.post(`${URL}/like`, { blogId, userId });
      console.log(res, blogId, userId, res.data);
      const isLiked = res.data === "yes";
      message.success(`Post ${isLiked ? "liked" : "unliked"} successfully!`);

      setBlogs((prev) => ({
        ...prev,
        data: prev.data.map((blog) => {
          if (blog._id === blogId) {
            return {
              ...blog,
              liked: isLiked,
              likeCount: isLiked ? blog.likeCount + 1 : blog.likeCount - 1,
            };
          }
          return blog;
        }),
      }));

      return isLiked;
    } catch (error) {
      console.error("Error liking blog:", error);
      return false;
    }
  }, []);

  return (
    <BlogsContext.Provider
      value={{
        blogs,
        allBlogs,
        newBlog,
        getBlog,
        removeBlog,
        saveBlog,
        statusBlog,
        myBlogsData,
        myBlogs,
        formatReadableDate,
        timeSince,
        getBlogById,
        likeBlog,
      }}
    >
      {children}
    </BlogsContext.Provider>
  );
}

export const useBlogsContext = () => useContext(BlogsContext);
