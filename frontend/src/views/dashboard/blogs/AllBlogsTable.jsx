/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { Empty, Spin, Carousel, message } from "antd";
import { Link } from "react-router-dom";
import VerifiedBadge from "../../../components/VerifiedBadge";
import { useBlogsContext } from "../../../context/main/BlogsContext";
import { useModalContext } from "../../../context/main/ModalContext";
import { useHashtagsContext } from "../../../context/main/HashtagsContext";
import { useTheme } from "../../../context/ThemeContext";
import { api } from "../../../helpers/api";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import BlogPostSkeleton from "../../../components/skeletons/BlogPostSkeleton";
import { useSearchDrawerContext } from "../../../context/main/SearchDrawerContext";

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
  const { processedText, handleHashtagClick: contextHandleHashtagClick } =
    useHashtagsContext();

  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [postsData, setPostsData] = useState([]);
  const [imageCache, setImageCache] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [submittingComments, setSubmittingComments] = useState({});
  const [commentDrafts, setCommentDrafts] = useState({});
  const { openSearchDrawer, setActiveTab, setSearchQuery } =
    useSearchDrawerContext();

  // Custom hashtag click handler for explicit hashtag lists
  const handleHashtagClick = (tag) => {
    // Make sure tag is a string
    const tagString = typeof tag === "string" ? tag : String(tag).trim();
    console.log("Hashtag clicked:", tagString);

    sessionStorage.setItem(
      "hashtagSearch",
      JSON.stringify({
        tag: tag, // Store as string
        tab: "Hashtags",
      })
    );
    // Open search drawer with the hashtag
    openSearchDrawer();
    setActiveTab("Posts"); // Make sure this matches the exact tab key
    setTimeout(() => {
      setSearchQuery(tagString);
    }, 100); // Add a small delay to ensure drawer is open
  };

  // Helper function to convert blob to data URL
  const blobToDataURL = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Helper function to get image URL
  const getImageUrl = async (imageId) => {
    try {
      if (!imageId) return null;

      // Check cache first
      if (imageCache[imageId]) {
        return imageCache[imageId];
      }

      // Use responseType: 'blob' to handle binary data
      const response = await api.get(`images/${imageId}`, {
        responseType: "blob",
      });

      if (response && response.data) {
        const contentType = response.headers["content-type"] || "image/jpeg";
        const imageUrl = await blobToDataURL(response.data, contentType);

        // Cache the result
        setImageCache((prev) => ({ ...prev, [imageId]: imageUrl }));
        return imageUrl;
      }
      return null;
    } catch (error) {
      console.error(`Error fetching image ${imageId}:`, error);
      return null;
    }
  };

  // Helper function to get avatar URL
  const getAvatarUrl = async (avatarId) => {
    if (!avatarId) return null;
    try {
      return await getImageUrl(avatarId);
    } catch (error) {
      console.error(`Error fetching avatar ${avatarId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setInitialLoading(true); // Set initial loading state
        await allBlogs();

        // Get user data from session storage
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
        // Only set initialLoading to false when blogs data is loaded
        // We'll keep the actual loading state true until images are processed
        if (blogs?.data) {
          setInitialLoading(false);
        }
      }
    };

    fetchData();
  }, [allBlogs]);

  // Process posts to include image URLs
  useEffect(() => {
    const processPosts = async () => {
      if (blogs?.data && Array.isArray(blogs.data)) {
        setLoading(true);

        try {
          // Process each blog post to include images
          const processedPosts = await Promise.all(
            blogs.data.map(async (post) => {
              // Get user avatar
              let avatarUrl = null;
              if (post.user?.avatar) {
                avatarUrl = await getAvatarUrl(post.user.avatar);
              }

              // Get post images
              let carouselImages = [];
              if (post.images && post.images.length > 0) {
                // Use Promise.allSettled to handle failures gracefully
                const imageResults = await Promise.allSettled(
                  post.images.map((imageId) => getImageUrl(imageId))
                );

                // Only include fulfilled promises
                carouselImages = imageResults
                  .filter(
                    (result) => result.status === "fulfilled" && result.value
                  )
                  .map((result) => result.value);
              }

              return {
                ...post,
                user: {
                  ...post.user,
                  avatarUrl,
                },
                carouselImages:
                  carouselImages.length > 0 ? carouselImages : null,
              };
            })
          );

          setPostsData(processedPosts);
        } catch (error) {
          console.error("Error processing posts:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    if (blogs?.data) {
      processPosts();
    }
  }, [blogs]);

  const openCommentsPage = (blogId, state) => {
    setToggle(blogId, state);
    console.log("Comments page is " + state + " for a blog with id:" + blogId);
  };

  // Toggle like
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

  // Handle updating comment draft
  const updateCommentDraft = (blogId, text) => {
    setCommentDrafts((prev) => ({
      ...prev,
      [blogId]: text,
    }));
  };

  // Get comment draft for a specific post
  const getCommentDraft = (blogId) => {
    return commentDrafts[blogId] || "";
  };

  // Handle comment submission with direct API call
  const handleSubmitComment = async (blogId) => {
    // Check if there's a comment to submit
    const commentText = commentDrafts[blogId];
    if (!commentText || commentText.trim() === "") return;

    try {
      // Set the submitting state for this specific blog post
      setSubmittingComments((prev) => ({ ...prev, [blogId]: true }));

      // Submit the comment directly with API
      await api.post(`posts/${blogId}/comments`, {
        body: commentText,
      });

      // Clear the comment draft after submission
      updateCommentDraft(blogId, "");

      // Update comment count optimistically
      setPostsData((prevPosts) =>
        prevPosts.map((post) =>
          post.id === blogId
            ? { ...post, commentCount: post.commentCount + 1 }
            : post
        )
      );

      // Show success message
      message.success("Comment posted successfully");
    } catch (error) {
      console.error("Failed to submit comment:", error);
      message.error("Failed to post comment. Please try again.");
    } finally {
      // Clear the submitting state
      setSubmittingComments((prev) => ({ ...prev, [blogId]: false }));
    }
  };

  // Generate placeholder skeletons
  const renderSkeletons = () => {
    // Calculate the number of skeletons to show based on viewport size or a fixed number
    const skeletonCount = 3;
    return Array.from({ length: skeletonCount }).map((_, index) => (
      <BlogPostSkeleton key={`skeleton-${index}`} />
    ));
  };

  // If initial data is loading (API call for blogs)
  if (initialLoading) {
    return (
      <div
        className={`px-0 py-5 pb-16 sm:px-1 ${
          isDark ? "bg-black" : "bg-white"
        }`}
        data-theme={theme}
      >
        <div className="rounded-lg p-0 mx-auto max-w-7xl">
          <div className="mx-auto grid max-w-[32rem] grid-cols-1 gap-x-8 gap-y-5">
            {renderSkeletons()}
          </div>
        </div>
      </div>
    );
  }

  // If no posts to show after loading
  if (!initialLoading && (!blogs?.data || blogs.data.length === 0)) {
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
          {loading
            ? // Show skeletons while posts are loading
              renderSkeletons()
            : // Show actual posts when ready
              postsData.map((blog) => (
                <article
                  key={blog.id}
                  className={`flex flex-col items-start justify-between ${
                    isDark ? "post-dark" : "post-light"
                  }`}
                >
                  <div className="relative w-full pl-1 pb-2 flex items-center gap-x-2">
                    <Link to={`/user/${blog.user?.username}`}>
                      <img
                        src={
                          blog.user?.avatarUrl ||
                          "https://placehold.co/80x80/gray/white?text=User"
                        }
                        alt=""
                        className="size-7 sm:size-9 rounded-full bg-gray-100"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/80x80/gray/white?text=User";
                        }}
                      />
                    </Link>
                    <div className="flex items-center justify-center gap-1 text-base leading-6">
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          isDark ? "text-white" : "text-black"
                        }`}
                      >
                        <Link
                          to={`/user/${blog.user?.username}`}
                          className={`font-semibold w-fit ${
                            isDark ? "text-white" : "text-black"
                          } `}
                        >
                          {blog.user?.username || "user"}
                        </Link>
                        {blog.user?.verified && <VerifiedBadge />}
                      </span>
                      <span className="hidden sm:block">·</span>
                      <div className="hidden sm:block time text-sm text-gray-500">
                        {timeSince(blog.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Image Carousel */}
                  <div className="relative w-full">
                    <div className="carousel-container aspect-[32/28] w-full overflow-hidden sm:rounded">
                      <Carousel
                        arrows={
                          blog.carouselImages && blog.carouselImages.length > 1
                        }
                        nextArrow={<NextArrow />}
                        prevArrow={<PrevArrow />}
                        dots={{ className: "custom-dots" }}
                        className="post-carousel"
                      >
                        {blog.carouselImages &&
                        blog.carouselImages.length > 0 ? (
                          blog.carouselImages.map((imageUrl, index) => (
                            <div key={index} className="carousel-item">
                              <div className="aspect-[32/28] w-full">
                                <img
                                  src={imageUrl}
                                  alt={`Post image ${index + 1}`}
                                  className="object-cover w-full h-full sm:rounded"
                                  loading="lazy"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src =
                                      "https://placehold.co/600x400/gray/white?text=Image+Not+Found";
                                  }}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="carousel-item">
                            <div className="aspect-[32/28] w-full">
                              <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                                <span className="text-gray-500">No images</span>
                              </div>
                            </div>
                          </div>
                        )}
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
                          <Link
                            to={`/user/${blog.user?.username}`}
                            className={`font-semibold w-fit ${
                              isDark ? "text-white" : "text-black"
                            } `}
                          >
                            {blog.user?.username || "user"}
                          </Link>
                          {blog.user?.verified && <VerifiedBadge />}
                        </span>
                        {blog.title}
                      </div>
                      <div>
                        {/* Post body with hashtag handling */}
                        <p
                          dangerouslySetInnerHTML={{
                            __html: processedText(blog.body || ""),
                          }}
                          className={`mt-1 text-sm ${
                            isDark ? "text-gray-300" : "text-black"
                          }`}
                          onClick={contextHandleHashtagClick} // Use the context's hashtag handler for body text
                        ></p>

                        {/* Add hashtags display below the post body */}
                        {blog.hashtags && blog.hashtags.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {blog.hashtags.map((tag, index) => (
                              <span
                                key={index}
                                className="text-blue-500 text-sm hover:text-blue-800 cursor-pointer"
                                onClick={() => handleHashtagClick(tag)} // Use our custom handler for explicit hashtags
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}
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

                    {/* Desktop Commenting section */}
                    <div
                      className={`hidden sm:flex mt-3 items-start space-x-4 border-b pb-2 ${
                        isDark ? "border-gray-800" : "border-gray-200"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <form
                          onSubmit={(e) => {
                            e.preventDefault();
                            handleSubmitComment(blog.id);
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
                              value={getCommentDraft(blog.id)}
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
                              disabled={submittingComments[blog.id]}
                              className={`inline-flex items-center rounded-md text-sm font-semibold bg-transparent text-gray-400 hover:text-gray-500 absolute top-1 right-0 ${
                                submittingComments[blog.id]
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            >
                              {submittingComments[blog.id] ? (
                                <div className="w-5 h-5 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin"></div>
                              ) : (
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
                              )}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>

                    {/* Mobile Commenting section */}
                    <div
                      className={`sm:hidden mt-3 items-start space-x-2 border-b pb-2 ${
                        isDark ? "border-gray-800" : "border-gray-200"
                      }`}
                    >
                      <form
                        className="flex items-center w-full"
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSubmitComment(blog.id);
                        }}
                      >
                        <input
                          type="text"
                          value={getCommentDraft(blog.id)}
                          onChange={(e) =>
                            updateCommentDraft(blog.id, e.target.value)
                          }
                          placeholder="Add a comment..."
                          className={`flex-grow text-sm border-0 focus:ring-0 ${
                            isDark
                              ? "bg-black text-gray-300 placeholder:text-gray-500"
                              : "bg-white text-gray-800 placeholder:text-gray-400"
                          }`}
                        />
                        <button
                          type="submit"
                          disabled={submittingComments[blog.id]}
                          className={`text-sm font-semibold bg-transparent ${
                            getCommentDraft(blog.id)?.trim()
                              ? "text-blue-500"
                              : "text-gray-400"
                          } ${submittingComments[blog.id] ? "opacity-50" : ""}`}
                        >
                          {submittingComments[blog.id] ? (
                            <div className="w-4 h-4 border-t-2 border-b-2 border-gray-500 rounded-full animate-spin mr-1"></div>
                          ) : (
                            "Post"
                          )}
                        </button>
                      </form>
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
