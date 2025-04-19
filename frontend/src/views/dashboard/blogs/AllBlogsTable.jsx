/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Empty, Spin, Carousel } from "antd"; // Added Carousel import
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import VerifiedBadge from "../../../components/VerifiedBadge";
import { useBlogsContext } from "../../../context/main/BlogsContext";
import { useModalContext } from "../../../context/main/ModalContext";
import { useCommentsContext } from "../../../context/main/CommentsContext";
import { useHashtagsContext } from "../../../context/main/HashtagsContext";
import { useTheme } from "../../../context/ThemeContext";
import { api } from "../../../helpers/api";
import { LeftOutlined, RightOutlined } from "@ant-design/icons"; // Added for custom arrows

// Sample array of carousel images for posts - used directly for all posts
const carouselImages = [
  "https://images.unsplash.com/photo-1682687982107-14492010e05e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
  "https://images.unsplash.com/photo-1682687220566-5599dbbebf11?ixlib=rb-4.0.3&ixid=M3wxMjA3fDF8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
];

// Custom arrow components for the carousel
const NextArrow = (props) => (
  <div className="custom-arrow next-arrow" onClick={props.onClick}>
    <RightOutlined style={{ color: "white", fontSize: "18px" }} />
  </div>
);

const PrevArrow = (props) => (
  <div className="custom-arrow prev-arrow" onClick={props.onClick}>
    <LeftOutlined style={{ color: "white", fontSize: "18px" }} />
  </div>
);

const AllBlogsTable = () => {
  const { blogs, allBlogs, timeSince } = useBlogsContext();
  const { setToggle } = useModalContext();
  const { getCommentDraft, updateCommentDraft, submitComment } =
    useCommentsContext();
  const { processedText, handleHashtagClick } = useHashtagsContext();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [postsData, setPostsData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await allBlogs();
        console.log("Fetched blogs:", result);

        // Get user data from session storage properly
        try {
          const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
          setUser(userData);
        } catch (parseError) {
          console.error("Error parsing user data:", parseError);
          setUser({});
        }
      } catch (err) {
        console.error("Error loading blogs:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [allBlogs]);

  // Update posts data when blogs change - don't add carousel images
  useEffect(() => {
    if (blogs && blogs.data && Array.isArray(blogs.data)) {
      setPostsData(blogs.data);
    }
  }, [blogs]);

  const openCommentsPage = (blogId, state) => {
    setToggle(blogId, state);
    console.log("Comments page is " + state + " for a blog with id:" + blogId);
  };

  // Toggle like without using localStorage
  const toggleLike = async (blog) => {
    if (!blog) return;

    try {
      // Update UI optimistically
      setPostsData((prevPosts) =>
        prevPosts.map((post) =>
          post.id === blog.id
            ? {
                ...post,
                liked: !post.liked,
                likeCount: post.liked
                  ? Math.max(0, post.likeCount - 1)
                  : post.likeCount + 1,
              }
            : post
        )
      );

      // Call API based on new liked status
      if (!blog.liked) {
        // If the post wasn't liked, like it now
        await api.post(`posts/${blog.id}/like`);
      } else {
        // If the post was liked, unlike it now
        await api.delete(`posts/${blog.id}/unlike`);
      }
    } catch (error) {
      console.error("Failed to toggle like:", error);
      // Revert UI on error
      setPostsData((prevPosts) =>
        prevPosts.map((post) => (post.id === blog.id ? blog : post))
      );
    }
  };

  const handleSubmitComment = (blogId, username) => {
    submitComment(blogId, username);
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  // If no posts to show
  if (!postsData || postsData.length === 0) {
    return (
      <Empty
        description={
          <span style={{ color: isDark ? "#a8a8a8" : "#737373" }}>
            No posts available yet...
          </span>
        }
      />
    );
  }

  return (
    <div
      className={`px-0 py-5 pb-16 sm:px-1 ${isDark ? "bg-black" : "bg-white"}`}
      data-theme={theme}
    >
      <div className="rounded-lg p-0 mx-auto max-w-7xl">
        <div className="mx-auto grid max-w-[32rem] grid-cols-1 gap-x-8 gap-y-5">
          {postsData.map((blog) => (
            <article
              key={blog.id}
              className={`flex flex-col items-start justify-between ${
                isDark ? "post-dark" : "post-light"
              }`}
            >
              <div className="relative w-full pl-1 pb-2 flex items-center gap-x-2">
                <a href="#">
                  <img
                    src={
                      blog.user?.avatar ||
                      "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    }
                    alt=""
                    className="size-7 sm:size-9 rounded-full bg-gray-100"
                  />
                </a>
                <div className="flex items-center justify-center gap-1 text-base leading-6">
                  <span
                    className={`font-bold flex items-center gap-1 ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    <a
                      href="#"
                      className={`font-semibold w-fit ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      {blog.user?.username}
                    </a>
                    {blog.user?.verified && <VerifiedBadge />}
                    {/* temporary badge */}
                    <VerifiedBadge />
                  </span>
                  <span className="hidden sm:block">·</span>
                  <div className="hidden sm:block time text-sm text-gray-500">
                    {timeSince(blog.createdAt)}
                  </div>
                </div>
              </div>

              {/* Image Carousel - using carouselImages directly */}
              <div className="relative w-full">
                <div className="carousel-container aspect-[32/28] w-full overflow-hidden sm:rounded">
                  <Carousel
                    arrows
                    nextArrow={<NextArrow />}
                    prevArrow={<PrevArrow />}
                    dots={{ className: "custom-dots" }}
                    className="post-carousel"
                  >
                    {carouselImages.map((image, index) => (
                      <div key={index} className="carousel-item">
                        <div className="aspect-[32/28] w-full">
                          <img
                            src={image}
                            alt={`Post image ${index + 1}`}
                            className="object-cover w-full h-full sm:rounded"
                            loading="lazy"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "./assets/notfoundimage.png"; // Your fallback image
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </Carousel>
                </div>
              </div>

              <div className="w-full px-1">
                <div className="mt-2 md-mt-4 flex items-center gap-x-3 text-xs">
                  <button
                    onClick={() => toggleLike(blog)}
                    className="relative rounded-full flex items-center justify-center gap-1 text-red-600 text-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={blog.liked ? "red" : "white"}
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="red"
                      className="size-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
                      />
                    </svg>
                    {blog.likeCount}
                  </button>
                  <button
                    onClick={() => openCommentsPage(blog.id, true)}
                    className="relative text-sm rounded-full flex items-center justify-center gap-1 hover:text-gray-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth="1.5"
                      stroke="currentColor"
                      className="size-7"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 20.25c4.97 0 9-3.694 9-8.25s-4.03-8.25-9-8.25S3 7.444 3 12c0 2.104.859 4.023 2.273 5.48.432.447.74 1.04.586 1.641a4.483 4.483 0 0 1-.923 1.785A5.969 5.969 0 0 0 6 21c1.282 0 2.47-.402 3.445-1.087.81.22 1.668.337 2.555.337Z"
                      />
                    </svg>
                    {blog.commentCount} comments
                  </button>
                </div>

                <div className="relative">
                  <div
                    className={`flex items-center gap-2 mt-1 text-sm sm:text-base font-semibold leading-5 ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    <span
                      className={`font-bold flex items-center ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      <a
                        href="#"
                        className={`font-semibold w-fit ${
                          isDark ? "text-white" : "text-black"
                        }`}
                      >
                        {blog.user?.username}
                      </a>
                      {blog.user?.verified && <VerifiedBadge />}
                      {/* temporary badge */}
                      <VerifiedBadge />
                    </span>
                    {blog.title}
                  </div>
                  <div onClick={(e) => handleHashtagClick(e)}>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: processedText(blog.body),
                      }}
                      className={`mt-1 text-sm ${
                        isDark ? "text-gray-300" : "text-black"
                      }`}
                    ></p>
                  </div>
                </div>

                <div className="block sm:hidden mt-2">
                  <div className="time text-xs sm:text-sm text-gray-600">
                    {timeSince(blog.createdAt)}
                  </div>
                </div>

                {blog.commentCount > 0 && (
                  <div className="hidden sm:block md:mt-2 text-xs sm:text-sm w-fit text-gray-600">
                    <button onClick={() => openCommentsPage(blog.id, true)}>
                      View all comments
                    </button>
                  </div>
                )}

                {/* Commenting section */}
                <div
                  className={`hidden sm:flex mt-3 items-start space-x-4 border-b pb-2 ${
                    isDark ? "border-gray-800" : "border-gray-200"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSubmitComment(blog.id, user.username);
                      }}
                    >
                      <div className="relative">
                        <label
                          htmlFor={`blogcomment-${blog.id}`}
                          className="sr-only"
                        >
                          Add a comment
                        </label>
                        <textarea
                          value={getCommentDraft(blog.id) || ""}
                          onChange={(e) =>
                            updateCommentDraft(blog.id, e.target.value)
                          }
                          rows="2"
                          name={`blogcomment-${blog.id}`}
                          id={`blogcomment-${blog.id}`}
                          className={`block w-full resize-none border-0 border-transparent p-0 pr-10 placeholder:text-sm focus:border-0 focus:ring-0 sm:text-sm sm:leading-6 ${
                            isDark
                              ? "bg-black text-gray-300 placeholder:text-gray-500"
                              : "bg-white text-gray-800 placeholder:text-gray-400"
                          }`}
                          placeholder="Add a comment..."
                        />
                        <button
                          type="submit"
                          className="inline-flex items-center rounded-md text-sm font-semibold bg-transparent text-gray-400 hover:text-gray-500 absolute top-1 right-0"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="currentColor"
                            className="size-6"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                            />
                          </svg>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AllBlogsTable;
