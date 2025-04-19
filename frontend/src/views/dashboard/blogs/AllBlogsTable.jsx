import React, { useEffect, useState } from "react";
import { Empty } from "antd";
import { Splide, SplideSlide } from "@splidejs/react-splide";
import "@splidejs/react-splide/css";
import { useBlogsContext } from "../../../context/main/BlogsContext";
import { useModalContext } from "../../../context/main/ModalContext";
import { useCommentsContext } from "../../../context/main/CommentsContext";
import { useHashtagsContext } from "../../../context/main/HashtagsContext";
import { useTheme } from "../../../context/ThemeContext";
import { URL } from "../../../helpers/api";
import {
  getLikesFromLocalStorage,
  updateLikesInLocalStorage,
} from "../../../utils/LocalStorageUtils";

const options = {
  type: "fade",
  rewind: true,
};

const AllBlogsTable = () => {
  const { blogs, allBlogs, timeSince, likeBlog } = useBlogsContext();
  const { setToggle } = useModalContext();
  const { getCommentDraft, updateCommentDraft, submitComment } = useCommentsContext();
  const { processedText, handleHashtagClick } = useHashtagsContext();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [user, setUser] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        await allBlogs();

        // Get user data from session storage
        const userData = JSON.parse(sessionStorage.getItem("user") || "{}");
        setUser(userData);

        // Update liked status from local storage
        const likes = getLikesFromLocalStorage();
        if (blogs.data.length > 0) {
          // We need to manually update each blog's liked status since we can't directly modify the blogs state
          blogs.data.forEach((blog) => {
            blog.liked = likes[blog._id] || false;
          });
        }
      } catch (err) {
        console.error("Error loading blogs:", err);
      }
    };

    fetchData();
  }, [allBlogs]);

  const openCommentsPage = (blogId, state) => {
    setToggle(blogId, state);
    console.log("Comments page is " + state + " for a blog with id:" + blogId);
  };

  const toggleLike = async (blog, userId) => {
    if (!blog) return;
    try {
      const isLiked = await likeBlog(blog._id, userId);
      blog.liked = isLiked;
      updateLikesInLocalStorage(blog._id, isLiked);
      console.log("Updated like status:", isLiked);
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const handleSubmitComment = (blogId, userId) => {
    submitComment(blogId, userId);
  };

  // If no blogs to show
  if (blogs.data.length === 0) {
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
          {blogs.data.map((blog) => (
            <article
              key={blog._id}
              className={`flex flex-col items-start justify-between ${
                isDark ? "post-dark" : "post-light"
              }`}
            >
              <div className="relative w-full pl-1 pb-2 flex items-center gap-x-2">
                <a href="#">
                  <img
                    src="https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                    alt=""
                    className="size-7 sm:size-9 rounded-full bg-gray-100"
                  />
                </a>
                <div className="flex items-center justify-center gap-1 text-sm leading-6">
                  <p
                    className={`font-bold ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    <a
                      href="#"
                      className={`font-semibold w-fit ${
                        isDark ? "text-white" : "text-black"
                      }`}
                    >
                      {blog.userId?.name} {blog.userId?.lname}
                    </a>
                  </p>
                  <span className="hidden sm:block">·</span>
                  <div className="hidden sm:block time text-sm text-gray-500">
                    {timeSince(blog.createdAt)}
                  </div>
                </div>
              </div>

              <div className="relative w-full">
                <Splide
                  options={{
                    ...options,
                    arrows: blog.image?.length > 1,
                    pagination: blog.image?.length > 1,
                  }}
                  aria-label="Post media"
                >
                  {blog.image && blog.image.length > 0 ? (
                    blog.image.map((img, index) => (
                      <SplideSlide key={index} className="aspect-[32/28]">
                        <img
                          src={`${URL}/${img.response}`}
                          alt=""
                          className="h-full w-full sm:rounded bg-gray-100 object-cover"
                        />
                      </SplideSlide>
                    ))
                  ) : (
                    <SplideSlide className="h-96">
                      <img
                        src="/images/notfound.png"
                        alt="Placeholder Image"
                        className="w-full h-full sm:rounded bg-gray-100 object-cover"
                      />
                    </SplideSlide>
                  )}
                </Splide>
                <div className="absolute inset-0 sm:rounded ring-1 ring-inset ring-gray-900/10" />
              </div>

              <div className="w-full px-1">
                <div className="mt-2 md-mt-4 flex items-center gap-x-3 text-xs">
                  <button
                    onClick={() => toggleLike(blog, user._id)}
                    className="relative rounded-full flex items-center justify-center gap-1 text-red-600 text-sm"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill={blog?.liked ? "red" : "white"}
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
                    onClick={() => openCommentsPage(blog._id, true)}
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
                    className={`mt-2 md:mt-3 text-sm sm:text-base font-semibold leading-5 ${
                      isDark ? "text-white" : "text-black"
                    }`}
                  >
                    {blog.title}
                  </div>
                  <div onClick={(e) => handleHashtagClick(e)}>
                    <p
                      dangerouslySetInnerHTML={{
                        __html: processedText(blog.text),
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

                {blog.commentCount !== 0 && (
                  <div className="hidden sm:block md:mt-2 text-xs sm:text-sm w-fit text-gray-600">
                    <button onClick={() => openCommentsPage(blog._id, true)}>
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
                        handleSubmitComment(blog._id, user._id);
                      }}
                    >
                      <div className="relative">
                        <label
                          htmlFor={`blogcomment-${blog._id}`}
                          className="sr-only"
                        >
                          Add a comment
                        </label>
                        <textarea
                          value={getCommentDraft(blog._id) || ""}
                          onChange={(e) =>
                            updateCommentDraft(blog._id, e.target.value)
                          }
                          rows="2"
                          name={`blogcomment-${blog._id}`}
                          id={`blogcomment-${blog._id}`}
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
