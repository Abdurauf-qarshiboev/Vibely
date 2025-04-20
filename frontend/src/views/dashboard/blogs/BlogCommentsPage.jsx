/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, EllipsisHorizontalIcon } from "@heroicons/react/24/outline";
import { useBlogsContext } from "@/context/main/BlogsContext";
import { useCommentsContext } from "@/context/main/CommentsContext";
import { useModalContext } from "@/context/main/ModalContext";
import { useAuth } from "@/context/AuthContext";
import { useHashtagsContext } from "@/context/main/HashtagsContext";
import { useTheme } from "@/context/ThemeContext";
import { Menu } from "@headlessui/react";
import { Carousel } from "antd";
import { api } from "../../../helpers/api";
import { getImageUrl } from "../../../utils/ImageHelpers";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import VerifiedBadge from "../../../components/VerifiedBadge";

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

const BlogCommentsPage = () => {
  const { getBlogById, timeSince } = useBlogsContext();
  const {
    getCommentDraft,
    updateCommentDraft,
    submitComment,
    getComment,
    editComment,
    removeComments,
  } = useCommentsContext();
  const { modalState, setToggle } = useModalContext();
  const { user } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const { processedText, checkAndCreateHashtags } = useHashtagsContext();

  const [blog, setBlog] = useState({});
  const [comments, setComments] = useState([]);
  const [open, setOpen] = useState(false);
  const [expandedComments, setExpandedComments] = useState([]);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imageCache, setImageCache] = useState({});
  const [postImages, setPostImages] = useState([]);
  const [avatarUrl, setAvatarUrl] = useState(null);

  // Refs
  const textareaRef = useRef(null);

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
  const fetchImageUrl = async (imageId) => {
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
        const imageUrl = await blobToDataURL(response.data);

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
      return await fetchImageUrl(avatarId);
    } catch (error) {
      console.error(`Error fetching avatar ${avatarId}:`, error);
      return null;
    }
  };

  // Load post images
  const loadPostImages = async (images) => {
    if (!images || !Array.isArray(images) || images.length === 0) return [];

    try {
      const imageUrls = await Promise.all(
        images.map(async (imageId) => {
          try {
            return await fetchImageUrl(imageId);
          } catch (error) {
            console.error(`Error loading image ${imageId}:`, error);
            return null;
          }
        })
      );

      return imageUrls.filter((url) => url !== null);
    } catch (error) {
      console.error("Error loading post images:", error);
      return [];
    }
  };

  useEffect(() => {
    // Add null check for modalState
    if (modalState && modalState.id) {
      const fetchData = async () => {
        try {
          setLoading(true);

          // Directly fetch post data from API using the ID
          const response = await api.get(`/posts/${modalState.id}`);

          if (response.data && response.data.success) {
            const postData = response.data.data;
            setBlog(postData);

            // Load post images
            if (postData.images && postData.images.length > 0) {
              const loadedImages = await loadPostImages(postData.images);
              setPostImages(loadedImages);
            }

            // Load user avatar
            if (postData.user?.avatar) {
              const userAvatarUrl = await getAvatarUrl(postData.user.avatar);
              setAvatarUrl(userAvatarUrl);
            }

            // Fetch comments for this post
            const commentsResponse = await api.get(
              `/posts/${modalState.id}/comments`
            );

            if (commentsResponse.data && commentsResponse.data.success) {
              // Map comments with expanded state
              setComments(
                commentsResponse.data.data.comments.map((comment) => ({
                  ...comment,
                  isTruncated: comment.body?.length > 200,
                }))
              );
            } else {
              setComments([]);
            }
          } else {
            console.error("Failed to fetch post details:", response);
            setBlog({});
            setComments([]);
          }
        } catch (err) {
          console.error("Error fetching post data:", err);
          setComments([]);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }
  }, [modalState]);

  // Update the toggleLike function
  const toggleLike = async (blog) => {
    if (!blog) return;
    try {
      // Call API based on new liked status
      if (!blog.liked) {
        // If the post wasn't liked, like it now
        await api.post(`posts/${blog.id}/like`);
      } else {
        // If the post was liked, unlike it now
        await api.delete(`posts/${blog.id}/unlike`);
      }

      // Update the blog in state
      setBlog((prev) => ({
        ...prev,
        liked: !prev.liked,
        likeCount: prev.liked
          ? Math.max(0, prev.likeCount - 1)
          : prev.likeCount + 1,
      }));
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  useEffect(() => {
    // Also add safety check here
    setOpen((modalState && modalState.toggle) || false);
    if (modalState && !modalState.toggle) {
      setTimeout(() => {
        setBlog({});
        setComments([]);
        setPostImages([]);
      }, 300);
    }
  }, [modalState]);

  const close = () => {
    setOpen(false);
    setTimeout(() => {
      setToggle(null, false);
      setBlog({});
      setComments([]);
      setPostImages([]);
    }, 300);
  };

  const focusTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      textareaRef.current.focus();
    }
  };

  const toggleCommentExpansion = (commentId) => {
    setExpandedComments((prev) =>
      prev.includes(commentId)
        ? prev.filter((id) => id !== commentId)
        : [...prev, commentId]
    );
  };

  const handleEditComment = async (commentId) => {
    const commentToEdit = comments.find((c) => c.id === commentId);
    if (commentToEdit) {
      setEditingCommentId(commentId);
      updateCommentDraft(blog.id, commentToEdit.body);
      focusTextarea();
    }
  };

  const handleSubmitComment = async (blogId, username) => {
    try {
      if (editingCommentId) {
        const updatedCommentText = getCommentDraft(blogId);
        const { allHashtags } = await checkAndCreateHashtags(
          updatedCommentText
        );
        console.log("comment hashtags after editing: ", allHashtags);
        await editComment(editingCommentId, blogId, username);
        setEditingCommentId(null);
      } else {
        const commentText = getCommentDraft(blogId);
        const { allHashtags } = await checkAndCreateHashtags(commentText);
        console.log("comment hashtags at first attempt: ", allHashtags);
        await submitComment(blogId, username);
      }

      // Refresh comments after submitting
      const response = await api.get(`/posts/${blogId}/comments`);
      if (response.data && response.data.success) {
        setComments(
          response.data.data.comments.map((comment) => ({
            ...comment,
            isTruncated: comment.body?.length > 200,
          }))
        );
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleRemoveComment = async (id) => {
    try {
      await removeComments(id);
      // Remove comment from local state
      setComments(comments.filter((comment) => comment.id !== id));
    } catch (err) {
      console.error(id, " Error removing comment: ", err);
    }
  };

  const handleHashtagClick = (event) => {
    console.log(event);
    close();
    // Use the modal context's handleHashtagClick
  };

  return (
    <Transition.Root show={open} as={React.Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={close}
        data-theme={theme}
      >
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={`${
              isDark ? "bg-black" : "bg-white"
            },"fixed inset-0 bg-opacity-70 transition-opacity"`}
          />
        </Transition.Child>

        <div
          className={`fixed inset-0 z-10 overflow-y-auto ${
            open ? "" : "hidden"
          }`}
        >
          <div className="absolute right-3 top-5 pr-3 pt-3">
            <button
              type="button"
              className={`"rounded-md bg-transparent ${
                isDark ? "text-white" : "text-black"
              } focus:outline-none focus:ring-0 focus:ring-none focus:ring-offset-0"`}
              onClick={close}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="size-7 font-bold" />
            </button>
          </div>
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0 ">
            <Transition.Child
              as={React.Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className={`relative transform overflow-hidden shadow-xl transition-all my-auto flex min-h-[20rem] sm:min-h-[30rem] md:min-h-[48rem] max-h-[54rem] sm:w-[calc(100%-64px-64px)] mx-auto max-w-[80rem] rounded border border-1 ${
                  isDark ? "border-white/10" : "shadow-md"
                }  ${isDark ? "bg-black" : "bg-white"}`}
              >
                {/* Left side - Images */}
                <div
                  className={` ${
                    isDark ? "bg-black" : "bg-transparent"
                  }"flex flex-col items-center justify-center max-w-[45rem] w-full lg:w-100 border-r border-r-1 border-white/10"`}
                >
                  <div className="grid place-content-center w-full h-full">
                    {/* Ant Design Carousel instead of Splide */}
                    <div className="carousel-container w-full h-full overflow-hidden">
                      {loading ? (
                        <div className="aspect-square w-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : (
                        <Carousel
                          arrows={postImages && postImages.length > 1}
                          nextArrow={<NextArrow />}
                          prevArrow={<PrevArrow />}
                          dots={{ className: "custom-dots" }}
                          className="post-carousel"
                        >
                          {postImages && postImages.length > 0 ? (
                            postImages.map((imageUrl, index) => (
                              <div key={index} className="carousel-item">
                                <div className="aspect-square w-full">
                                  <img
                                    src={imageUrl}
                                    alt={`Post image ${index + 1}`}
                                    className="object-contain w-full h-full"
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
                              <div className="aspect-square w-full h-full">
                                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                                  <img
                                    className="object-contain w-60 h-60"
                                    src="./assets/no-image-placeholder.jpeg"
                                    alt="image not found"
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </Carousel>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right side - Comments */}
                <div className="relative hidden flex-1 lg:min-w-[25rem] min-w-[21rem] md:min-w-[23rem] sm:flex flex-col items-start justify-center pt-2">
                  {/* User info */}
                  <div
                    className={`w-full flex items-center gap-x-3 mb-2 lg:mb-3 px-3 lg:px-4 py-1`}
                  >
                    <img
                      src={
                        avatarUrl ||
                        "https://placehold.co/80x80/gray/white?text=User"
                      }
                      alt=""
                      className="size-9 rounded-full bg-gray-100 cursor-pointer"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src =
                          "https://placehold.co/80x80/gray/white?text=User";
                      }}
                    />
                    <div className="flex items-center justify-center gap-1 text-sm leading-6 cursor-pointer">
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          isDark ? "text-white" : "text-black"
                        }`}
                      >
                        <a
                          href="#"
                          className={`font-semibold leading-5 text-sm ${
                            isDark
                              ? "text-white hover:text-gray-300"
                              : "hover:text-gray-700"
                          }`}
                        >
                          {blog.user?.username || "user"}
                        </a>
                        {blog.user?.verified && <VerifiedBadge />}
                      </span>
                    </div>
                  </div>

                  {/* Comments section */}
                  <div
                    className={`flex-1 w-full overflow-y-auto p-3 lg:p-4 border-b border-t ${
                      isDark ? "border-white/30" : "border-black/10"
                    } scrollbar-hidden`}
                  >
                    {/* Blog text */}
                    <div className="flex gap-x-3 pb-2 lg:pb-3">
                      <a href="#" className="size-8 flex-none">
                        <img
                          src={
                            avatarUrl ||
                            "https://placehold.co/80x80/gray/white?text=User"
                          }
                          alt=""
                          className="rounded-full bg-gray-100 cursor-pointer"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/80x80/gray/white?text=User";
                          }}
                        />
                      </a>
                      <div className="flex-auto">
                        <div className="flex items-baseline justify-between gap-x-3 text-sm">
                          <span className="flex items-center gap-1 cursor-pointer mt-1">
                            <a
                              href="#"
                              className={`font-semibold leading-5 text-sm ${
                                isDark
                                  ? "text-white hover:text-gray-300"
                                  : "hover:text-gray-700"
                              }`}
                            >
                              {blog.user?.username || "user"}
                            </a>
                            {blog.user?.verified && <VerifiedBadge />}
                          </span>
                        </div>
                        <div>
                          {blog.title && (
                            <div
                              className={`font-semibold text-left mt-1 ${
                                isDark ? "text-white" : "text-black"
                              }`}
                            >
                              {blog.title}
                            </div>
                          )}
                          <div
                            dangerouslySetInnerHTML={{
                              __html: processedText(blog.body || ""),
                            }}
                            className={`text-sm leading-5 text-left ${
                              isDark ? "text-gray-300" : "text-black"
                            }`}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Comments list */}
                    <ul role="list" className="h-auto">
                      {loading ? (
                        <div className="flex justify-center items-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : comments.length > 0 ? (
                        comments.map((comment) => (
                          <li
                            key={comment.id}
                            className="flex gap-x-3 lg:py-3 py-2"
                          >
                            <a href="#" className="size-8 flex-none">
                              <img
                                className="rounded-full bg-gray-50"
                                src={
                                  "https://placehold.co/80x80/gray/white?text=User"
                                }
                                alt=""
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src =
                                    "https://placehold.co/80x80/gray/white?text=User";
                                }}
                              />
                            </a>
                            <div className="flex-auto">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center justify-start gap-x-2">
                                  <span className="flex items-center gap-1">
                                    <div
                                      className={`text-sm font-semibold leading-5 hover:text-gray-500 cursor-pointer ${
                                        isDark ? "text-white" : "text-black"
                                      }`}
                                    >
                                      {comment.user?.firstName ||
                                        comment.user?.username ||
                                        "User"}{" "}
                                      {comment.user?.lastName || ""}
                                    </div>
                                    {comment.user?.verified && (
                                      <VerifiedBadge />
                                    )}
                                  </span>
                                </div>
                              </div>
                              <div
                                className="flex flex-col items-center"
                                id="commentContainer"
                              >
                                <div
                                  onClick={handleHashtagClick}
                                  className="w-full"
                                >
                                  <p
                                    dangerouslySetInnerHTML={{
                                      __html: processedText(comment.body || ""),
                                    }}
                                    className={`text-sm text-left w-full leading-5 ${
                                      isDark ? "text-gray-300" : "text-black"
                                    } ${
                                      expandedComments.includes(comment.id)
                                        ? "line-clamp-none"
                                        : "line-clamp-4"
                                    }`}
                                  />
                                </div>
                                {comment.isTruncated && (
                                  <button
                                    onClick={() =>
                                      toggleCommentExpansion(comment.id)
                                    }
                                    className={`w-fit mt-1 font-semibold text-xs ${
                                      isDark
                                        ? "text-gray-400 hover:text-gray-300"
                                        : "text-gray-500 hover:text-gray-700"
                                    }`}
                                  >
                                    {expandedComments.includes(comment.id)
                                      ? "(Read less)"
                                      : "(Read more)"}
                                  </button>
                                )}
                              </div>
                              <div className="flex items-center gap-x-2 group">
                                <div
                                  className={`flex-none text-xs leading-5 ${
                                    isDark ? "text-gray-400" : "text-gray-600"
                                  }`}
                                >
                                  {timeSince(comment.created_at)}
                                </div>
                                {comment.user?.username === user.username && (
                                  <Menu as="div" className="relative flex-none">
                                    <Menu.Button
                                      className={`block ${
                                        isDark
                                          ? "text-gray-400 hover:text-white"
                                          : "text-gray-500 hover:text-black"
                                      }`}
                                    >
                                      <span className="sr-only">Actions</span>
                                      <EllipsisHorizontalIcon
                                        className="h-4 w-4"
                                        aria-hidden="true"
                                      />
                                    </Menu.Button>
                                    <Transition
                                      enter="transition ease-out duration-100"
                                      enterFrom="transform opacity-0 scale-95"
                                      enterTo="transform opacity-100 scale-100"
                                      leave="transition ease-in duration-75"
                                      leaveFrom="transform opacity-100 scale-100"
                                      leaveTo="transform opacity-0 scale-95"
                                    >
                                      <Menu.Items
                                        className={`absolute right-3 top-1 z-10 w-24 origin-top-right rounded-md py-0 overflow-hidden shadow-lg ring-1 px-[6px] ring-gray-900/5 focus:outline-none ${
                                          isDark ? "bg-gray-800" : "bg-white"
                                        }`}
                                      >
                                        <Menu.Item>
                                          {({ active }) => (
                                            <button
                                              onClick={() =>
                                                handleEditComment(comment.id)
                                              }
                                              className={`
                                                flex items-center justify-between px-0 py-1 text-sm leading-6 text-yellow-600 w-full text-left
                                                ${
                                                  active
                                                    ? isDark
                                                      ? "bg-gray-700"
                                                      : "bg-gray-50"
                                                    : ""
                                                }
                                              `}
                                            >
                                              Edit
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="size-4"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                                                />
                                              </svg>
                                              <span className="sr-only">
                                                , {comment.id}
                                              </span>
                                            </button>
                                          )}
                                        </Menu.Item>
                                        <Menu.Item>
                                          {({ active }) => (
                                            <button
                                              onClick={() =>
                                                handleRemoveComment(comment.id)
                                              }
                                              className={`
                                                px-0 py-1 text-sm leading-6 text-red-700 flex items-center justify-between w-full text-left
                                                ${
                                                  active
                                                    ? isDark
                                                      ? "bg-gray-700"
                                                      : "bg-gray-50"
                                                    : ""
                                                }
                                              `}
                                            >
                                              Delete
                                              <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="#C62828"
                                                className="size-4"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                />
                                              </svg>
                                              <span className="sr-only">
                                                {comment.id}
                                              </span>
                                            </button>
                                          )}
                                        </Menu.Item>
                                      </Menu.Items>
                                    </Transition>
                                  </Menu>
                                )}
                              </div>
                            </div>
                          </li>
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No comments yet.
                        </div>
                      )}
                    </ul>
                  </div>

                  {/* Bottom actions section */}
                  <div className="w-full">
                    {/* Like and comment buttons */}
                    <div className="w-full flex items-center gap-x-2 text-sm mt-1 px-3 lg:px-4 py-1">
                      <button
                        onClick={() => toggleLike(blog)}
                        className="relative z-10 rounded-full flex items-center justify-center gap-1 text-red-500"
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
                        onClick={focusTextarea}
                        className={`relative z-10 rounded-full flex items-center justify-center gap-1 ${
                          isDark
                            ? "text-white hover:text-gray-300"
                            : "text-black hover:text-gray-500"
                        }`}
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
                      </button>
                    </div>

                    {/* Stats */}
                    <div className="w-full flex flex-col items-start justify-center px-4 lg:px-5 py-1">
                      <div
                        className={`text-sm font-bold ${
                          isDark ? "text-gray-300" : "text-gray-700"
                        }`}
                      >
                        {comments.length} comments
                      </div>
                      <div className="time text-sm text-gray-500">
                        {timeSince(blog.createdAt)}
                      </div>
                    </div>

                    {/* Comment form */}
                    <div
                      className={`w-full mt-1 py-2 px-3 lg:px-4 flex items-start space-x-4 border-t ${
                        isDark ? "border-gray-700" : "border-gray-300"
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
                            <label htmlFor="comment" className="sr-only">
                              Add a comment
                            </label>
                            <textarea
                              value={getCommentDraft(blog.id) || ""}
                              onChange={(e) =>
                                updateCommentDraft(blog.id, e.target.value)
                              }
                              rows="2"
                              name="comment"
                              id="comment"
                              ref={textareaRef}
                              className={`block w-full resize-none border-0 border-transparent p-0 pr-10 placeholder:text-sm focus:border-0 focus:ring-0 sm:text-sm sm:leading-6 scrollbar-none ${
                                isDark
                                  ? "bg-black text-gray-300 placeholder:text-gray-500"
                                  : "bg-white text-gray-800 placeholder:text-gray-400"
                              }`}
                              placeholder="Add a comment..."
                            />
                            <button
                              type="submit"
                              className={`inline-flex items-center rounded-md text-sm font-semibold bg-transparent absolute top-1 right-0 ${
                                isDark
                                  ? "text-gray-400 hover:text-gray-300"
                                  : "text-gray-400 hover:text-gray-500"
                              }`}
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
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default BlogCommentsPage;
