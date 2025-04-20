/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  XMarkIcon,
  EllipsisHorizontalIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import { useBlogsContext } from "@/context/main/BlogsContext";
import { useCommentsContext } from "@/context/main/CommentsContext";
import { useModalContext } from "@/context/main/ModalContext";
import { useAuth } from "@/context/AuthContext";
import { useHashtagsContext } from "@/context/main/HashtagsContext";
import { useTheme } from "@/context/ThemeContext";
import { Menu } from "@headlessui/react";
import { Link, useNavigate } from "react-router-dom";
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

const Comment = ({
  comment,
  postId,
  handleEditComment,
  handleRemoveComment,
  timeSince,
  isDark,
  currentUser,
  processedText,
  toggleCommentExpansion,
  expandedComments,
  handleReply,
}) => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likeCount || 0);
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Function to handle username click
  const handleUsernameClick = (username) => {
    navigate(`/user/${username}`);
  };

  // Toggle comment like
  const toggleLike = async () => {
    try {
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev - 1 : prev + 1));

      // API call would go here if you have a like endpoint
      // await api.post(`/comments/${comment.id}/like`);
    } catch (error) {
      console.error("Error liking comment:", error);
      // Revert state on error
      setLiked((prev) => !prev);
      setLikeCount((prev) => (liked ? prev + 1 : prev - 1));
    }
  };

  // Load replies
  const loadReplies = async () => {
    if (comment.replyCount === 0) return;

    setLoading(true);
    try {
      const response = await api.get(`/comments/${comment.id}/replies`);
      if (response.data && response.data.success) {
        // Ensure we're getting an array, even if it's empty
        const repliesData = response.data.data || [];

        // If the API returns an object with a replies property, use that
        const repliesList = Array.isArray(repliesData)
          ? repliesData
          : repliesData.replies && Array.isArray(repliesData.replies)
          ? repliesData.replies
          : [];

        setReplies(repliesList);
      } else {
        setReplies([]);
      }
    } catch (error) {
      console.error("Error loading replies:", error);
      setReplies([]);
    } finally {
      setLoading(false);
    }

    setShowReplies((prev) => !prev);
  };

  return (
    <div className="mb-3">
      <div className="flex gap-x-3">
        <div className="flex-none">
          <img
            src={
              "https://placehold.co/80x80/gray/white?text=User"
            }
            alt=""
            className="w-8 h-8 rounded-full bg-gray-100 cursor-pointer"
            onClick={() => handleUsernameClick(comment.user?.username)}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/80x80/gray/white?text=User";
            }}
          />
        </div>

        <div className="flex-auto">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-baseline flex-wrap">
                <span
                  className={`font-semibold text-sm mr-2 hover:underline cursor-pointer ${
                    isDark ? "text-white" : "text-gray-900"
                  }`}
                  onClick={() => handleUsernameClick(comment.user?.username)}
                >
                  {comment.user?.username}
                  {comment.user?.verified && (
                    <VerifiedBadge className="inline ml-1" />
                  )}
                </span>

                <span
                  dangerouslySetInnerHTML={{
                    __html: processedText(comment.body || ""),
                  }}
                  className={`text-sm ${
                    isDark ? "text-gray-300" : "text-gray-800"
                  } ${
                    expandedComments.includes(comment.id)
                      ? "line-clamp-none"
                      : "line-clamp-3"
                  }`}
                />
              </div>

              {/* Comment actions */}
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-xs text-gray-500">
                  {timeSince(comment.created_at)}
                </span>

                {likeCount > 0 && (
                  <span className="text-xs font-semibold text-gray-500">
                    {likeCount} {likeCount === 1 ? "like" : "likes"}
                  </span>
                )}

                <button
                  className="text-xs font-semibold text-gray-500"
                  onClick={() =>
                    handleReply(comment.user?.username, comment.id)
                  }
                >
                  Reply
                </button>

                {comment.isTruncated && (
                  <button
                    onClick={() => toggleCommentExpansion(comment.id)}
                    className={`text-xs font-semibold ${
                      isDark
                        ? "text-gray-400 hover:text-gray-300"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {expandedComments.includes(comment.id) ? "less" : "more"}
                  </button>
                )}
              </div>

              {/* View/Hide replies */}
              {comment.replyCount > 0 && (
                <button
                  className={`flex items-center mt-1 text-xs ${
                    isDark ? "text-blue-400" : "text-blue-600"
                  }`}
                  onClick={loadReplies}
                >
                  <div className="w-5 h-[1px] bg-gray-300 mr-2"></div>
                  {!showReplies
                    ? `View replies (${comment.replyCount})`
                    : "Hide replies"}
                </button>
              )}

              {/* Display replies */}
              {showReplies && (
                <div className="mt-1 space-y-3">
                  {loading && (
                    <div className="flex justify-center py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  )}

                  {/* Fix the error by ensuring replies is an array before mapping */}
                  {Array.isArray(replies) ? (
                    replies.map((reply) => (
                      <Comment
                        key={reply.id}
                        comment={reply}
                        postId={postId}
                        handleEditComment={handleEditComment}
                        handleRemoveComment={handleRemoveComment}
                        timeSince={timeSince}
                        isDark={isDark}
                        currentUser={currentUser}
                        processedText={processedText}
                        toggleCommentExpansion={toggleCommentExpansion}
                        expandedComments={expandedComments}
                        handleReply={handleReply}
                      />
                    ))
                  ) : (
                    <div className="text-sm text-gray-500">
                      No replies available
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-start space-x-2">
              <button onClick={toggleLike} className="focus:outline-none">
                {liked ? (
                  <HeartSolid className="h-3.5 w-3.5 text-red-500" />
                ) : (
                  <HeartIcon className="h-3.5 w-3.5 text-gray-500 hover:text-gray-700" />
                )}
              </button>

              {comment.user?.username === currentUser?.username && (
                <Menu as="div" className="relative">
                  <Menu.Button
                    className={`${
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
                      className={`absolute right-0 top-0 z-10 w-24 origin-top-right rounded-md py-0 overflow-hidden shadow-lg ring-1 px-[6px] ring-gray-900/5 focus:outline-none ${
                        isDark ? "bg-gray-800" : "bg-white"
                      }`}
                    >
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleEditComment(comment.id)}
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
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleRemoveComment(comment.id)}
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
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const BlogCommentsPage = () => {
  const navigate = useNavigate();
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
  const [replyingTo, setReplyingTo] = useState(null);
  const [parentCommentId, setParentCommentId] = useState(null);
  const [commentText, setCommentText] = useState("");

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

  // Function to handle replying to a comment
  const handleReply = (username, parentId) => {
    setReplyingTo(username);
    setParentCommentId(parentId);
    setCommentText(`@${username} `);
    focusTextarea();
  };

  // Cancel reply
  const cancelReply = () => {
    setReplyingTo(null);
    setParentCommentId(null);
    setCommentText("");
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
      setCommentText(commentToEdit.body);
      focusTextarea();
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();

    if (!commentText.trim()) return;

    try {
      setLoading(true);

      if (editingCommentId) {
        // Update existing comment
        const response = await api.put(`/comments/${editingCommentId}`, {
          body: commentText,
        });

        if (response.data && response.data.success) {
          // Update comment in state
          setComments((prev) =>
            prev.map((comment) =>
              comment.id === editingCommentId
                ? {
                    ...comment,
                    body: commentText,
                    updated_at: response.data.data.updated_at,
                  }
                : comment
            )
          );

          setEditingCommentId(null);
        }
      } else {
        // Create new comment or reply
        const response = await api.post(`/posts/${blog.id}/comments`, {
          body: commentText,
          parent_comment_id: parentCommentId,
        });

        if (response.data && response.data.success) {
          // Refresh comments
          const commentsResponse = await api.get(`/posts/${blog.id}/comments`);
          if (commentsResponse.data && commentsResponse.data.success) {
            setComments(
              commentsResponse.data.data.comments.map((comment) => ({
                ...comment,
                isTruncated: comment.body?.length > 200,
              }))
            );
          }
        }
      }

      // Reset form
      setCommentText("");
      setReplyingTo(null);
      setParentCommentId(null);
    } catch (error) {
      console.error("Error submitting comment:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveComment = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/comments/${id}`);
      // Remove comment from local state
      setComments(comments.filter((comment) => comment.id !== id));
    } catch (err) {
      console.error("Error removing comment:", err);
    } finally {
      setLoading(false);
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
              className={`"rounded-md bg-transparent text-gray-600 focus:outline-none focus:ring-0 focus:ring-none focus:ring-offset-0"`}
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
                      {loading && !postImages.length ? (
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
                <div className="relative hidden flex-1 lg:min-w-[25rem] min-w-[21rem] md:min-w-[23rem] sm:flex flex-col items-start justify-center">
                  {/* User info */}
                  <div
                    className={`w-full flex items-center gap-x-3 px-3 lg:px-4 py-3 border-b ${
                      isDark ? "border-gray-800" : "border-gray-200"
                    }`}
                  >
                    <div className="flex-none">
                      <img
                        onClick={() => navigate(`/user/${blog.user?.username}`)}
                        src={
                          avatarUrl ||
                          "https://placehold.co/80x80/gray/white?text=User"
                        }
                        alt=""
                        className="w-8 h-8 rounded-full bg-gray-100 cursor-pointer"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://placehold.co/80x80/gray/white?text=User";
                        }}
                      />
                    </div>
                    <div className="flex items-center justify-center gap-1 text-sm leading-6 cursor-pointer">
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          isDark ? "text-white" : "text-black"
                        }`}
                      >
                        <div
                          onClick={() =>
                            navigate(`/user/${blog.user?.username}`)
                          }
                          className={`font-semibold leading-5 text-sm hover:underline ${
                            isDark
                              ? "text-white hover:text-gray-300"
                              : "hover:text-gray-700"
                          }`}
                        >
                          {blog.user?.username || "user"}
                        </div>
                        {blog.user?.verified && <VerifiedBadge />}
                      </span>
                    </div>
                  </div>

                  {/* Comments section */}
                  <div
                    className={`flex-1 w-full overflow-y-auto p-3 lg:p-4 ${
                      isDark ? "" : ""
                    } scrollbar-hidden`}
                  >
                    {/* Blog text */}
                    <div className="flex gap-x-3 pb-4 mb-4 border-b border-gray-200 dark:border-gray-800">
                      <div className="flex-none">
                        <img
                          onClick={() =>
                            navigate(`/user/${blog.user?.username}`)
                          }
                          src={
                            avatarUrl ||
                            "https://placehold.co/80x80/gray/white?text=User"
                          }
                          alt=""
                          className="w-8 h-8 rounded-full bg-gray-100 cursor-pointer"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/80x80/gray/white?text=User";
                          }}
                        />
                      </div>
                      <div className="flex-auto">
                        <div className="flex items-baseline justify-between gap-x-3">
                          <span className="flex items-center gap-1 cursor-pointer">
                            <div
                              onClick={() =>
                                navigate(`/user/${blog.user?.username}`)
                              }
                              className={`font-semibold text-sm hover:underline ${
                                isDark
                                  ? "text-white hover:text-gray-300"
                                  : "hover:text-gray-700"
                              }`}
                            >
                              {blog.user?.username || "user"}
                            </div>
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
                          {/* Add hashtags display below the post body */}
                          {blog.hashtags && blog.hashtags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {blog.hashtags.map((tag, index) => (
                                <span
                                  key={index}
                                  className={`text-blue-500 text-sm hover:text-blue-800 cursor-pointer`}
                                  onClick={() =>
                                    handleHashtagClick({
                                      target: { innerText: `#${tag}` },
                                    })
                                  }
                                >
                                  #{tag}
                                </span>
                              ))}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            {timeSince(blog.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Comments list */}
                    <div className="space-y-4">
                      {loading && !comments.length ? (
                        <div className="flex justify-center items-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                        </div>
                      ) : comments.length > 0 ? (
                        comments.map((comment) => (
                          <Comment
                            key={comment.id}
                            comment={comment}
                            postId={blog.id}
                            handleEditComment={handleEditComment}
                            handleRemoveComment={handleRemoveComment}
                            timeSince={timeSince}
                            isDark={isDark}
                            currentUser={user}
                            processedText={processedText}
                            toggleCommentExpansion={toggleCommentExpansion}
                            expandedComments={expandedComments}
                            handleReply={handleReply}
                          />
                        ))
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          No comments yet. Be the first to comment!
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom actions section */}
                  <div className="w-full border-t border-gray-200 dark:border-gray-800">
                    {/* Like and comment buttons */}
                    <div className="w-full flex items-center gap-x-4 px-4 py-3">
                      <button
                        onClick={() => toggleLike(blog)}
                        className="relative z-10 flex items-center justify-center"
                      >
                        {blog?.liked ? (
                          <HeartSolid className="w-6 h-6 text-red-500" />
                        ) : (
                          <HeartIcon
                            className={`w-6 h-6 ${
                              isDark ? "text-white" : "text-gray-900"
                            }`}
                          />
                        )}
                      </button>
                      <button
                        onClick={focusTextarea}
                        className={`relative z-10 flex items-center justify-center`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="currentColor"
                          className="w-6 h-6"
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
                    <div className="w-full px-4 py-1">
                      <div
                        className={`text-sm font-bold ${
                          isDark ? "text-gray-200" : "text-gray-900"
                        }`}
                      >
                        {blog.likeCount || 0} likes
                      </div>
                    </div>

                    {/* Comment form */}
                    <div
                      className={`w-full mt-1 py-3 px-4 flex items-center space-x-2 border-t ${
                        isDark ? "border-gray-800" : "border-gray-200"
                      }`}
                    >
                      {replyingTo && (
                        <div className="flex items-center text-xs bg-gray-100 px-1 py-1 rounded-md">
                          Replying to @{replyingTo}
                          <button
                            onClick={cancelReply}
                            className="ml-1 text-gray-600"
                          >
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      )}

                      <form
                        className="w-full flex items-center"
                        onSubmit={handleSubmitComment}
                      >
                        <input
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Add a comment..."
                          ref={textareaRef}
                          className={`block w-full text-sm border-0 focus:ring-0 ${
                            isDark
                              ? "bg-black text-gray-300 placeholder:text-gray-500"
                              : "bg-white text-gray-800 placeholder:text-gray-400"
                          }`}
                        />
                        <button
                          type="submit"
                          disabled={!commentText.trim() || loading}
                          className={`text-blue-500 font-semibold text-sm ${
                            !commentText.trim() || loading ? "opacity-50" : ""
                          }`}
                        >
                          {loading
                            ? "Posting..."
                            : editingCommentId
                            ? "Update"
                            : "Post"}
                        </button>
                      </form>
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
