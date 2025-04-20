import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "@/helpers/api";
import { useTheme } from "@/context/ThemeContext";
import { XMarkIcon, PlusIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { getImageUrl } from "@/utils/ImageHelpers";

const EditPostPage = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get post ID from URL
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const fileInputRef = useRef(null);

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);
  const [errors, setErrors] = useState({});
  const [imageCache, setImageCache] = useState({});

  // Load post data
  useEffect(() => {
    const fetchPostData = async () => {
      if (!id) return;

      try {
        console.log("Fetching post data for ID:", id);
        setLoadingPost(true);

        const response = await api.get(`/posts/${id}`);

        if (response.data && response.data.success) {
          const postData = response.data.data;
          console.log("Post data loaded:", postData);

          // Set form fields with post data
          setTitle(postData.title || "");
          setBody(postData.body || "");
          setIsPrivate(postData.isPrivate || false);
          setHashtags(postData.hashtags || []);

          // Load existing images
          if (postData.images && postData.images.length > 0) {
            setExistingImages(postData.images);

            // Load image previews
            const previewUrls = [];
            for (const imageId of postData.images) {
              try {
                console.log("Loading image preview for ID:", imageId);
                const imageUrl = await getImageUrl(
                  imageId,
                  imageCache,
                  setImageCache
                );
                if (imageUrl) {
                  previewUrls.push({ id: imageId, url: imageUrl });
                }
              } catch (error) {
                console.error(`Error loading image ${imageId}:`, error);
              }
            }

            setPreviewImages(previewUrls);
          }
        } else {
          toast.error("Failed to load post data");
          navigate(-1);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
        toast.error(
          error.response?.data?.message || "Failed to load post data"
        );
        navigate(-1);
      } finally {
        setLoadingPost(false);
      }
    };

    fetchPostData();
  }, [id, navigate]);

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + newImages.length + existingImages.length > 10) {
      toast.error("You can only upload up to 10 images");
      return;
    }

    // Add new images
    setNewImages((prevImages) => [...prevImages, ...files]);

    // Create preview URLs for the images
    const newPreviewImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviewImages((prevPreviews) => [...prevPreviews, ...newPreviewImages]);
  };

  // Remove an image from the selection
  const removeImage = (index) => {
    const isExistingImage = index < existingImages.length;

    if (isExistingImage) {
      // Handle removing existing image
      const newExistingImages = [...existingImages];
      const removedId = newExistingImages.splice(index, 1)[0];
      setExistingImages(newExistingImages);

      // Remove from preview images too
      const newPreviews = previewImages.filter(
        (preview) => preview.id !== removedId
      );
      setPreviewImages(newPreviews);
    } else {
      // Handle removing new image
      const adjustedIndex = index - existingImages.length;

      // Remove from new images array
      const newImagesArray = [...newImages];
      newImagesArray.splice(adjustedIndex, 1);
      setNewImages(newImagesArray);

      // Find and remove the corresponding preview - FIXED VERSION
      const previewsWithoutNewImages = previewImages.filter((p) =>
        Object.prototype.hasOwnProperty.call(p, "id")
      );
      const previewsWithNewImages = previewImages.filter((p) =>
        Object.prototype.hasOwnProperty.call(p, "file")
      );
      previewsWithNewImages.splice(adjustedIndex, 1);

      // Revoke the object URL to avoid memory leaks
      const previewToRemove = previewImages.find((_, i) => i === index);
      if (previewToRemove && previewToRemove.url && !previewToRemove.id) {
        URL.revokeObjectURL(previewToRemove.url);
      }

      setPreviewImages([...previewsWithoutNewImages, ...previewsWithNewImages]);
    }
  };

  // Add a hashtag to the list
  const addHashtag = () => {
    if (!hashtagInput.trim()) return;

    // The user might enter multiple words or hashtags separated by spaces
    const tagsToAdd = hashtagInput
      .trim()
      .split(/\s+/)
      .map((tag) => tag.replace(/^#/, "")); // Remove # if user added it

    // Filter out empty tags and tags that already exist
    const newTags = tagsToAdd.filter((tag) => tag && !hashtags.includes(tag));

    if (newTags.length > 0) {
      setHashtags([...hashtags, ...newTags]);
      setHashtagInput("");
    }
  };

  // Handle pressing Enter in hashtag input
  const handleHashtagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addHashtag();
    }
  };

  // Remove a hashtag from the list
  const removeHashtag = (tagToRemove) => {
    setHashtags(hashtags.filter((tag) => tag !== tagToRemove));
  };

  // Validate the form
  const validateForm = () => {
    const errors = {};

    if (!title.trim()) {
      errors.title = "Title is required";
    }

    if (!body.trim()) {
      errors.body = "Content is required";
    }

    return errors;
  };

  // Submit the form
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate the form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      // Create FormData to handle file uploads
      const formData = new FormData();

      // Add post data as JSON
      const postData = {
        title,
        body,
        isPrivate,
        hashtags,
        existingImages: existingImages, // Keep track of existing images
      };

      formData.append("request", JSON.stringify(postData));

      // Add new images
      newImages.forEach((image) => {
        formData.append("image", image);
      });

      console.log("Updating post:", id, postData);

      // Send the request
      const response = await api.put(`/posts/${id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data && response.data.success) {
        toast.success("Post updated successfully!");

        // Clean up preview image URLs to avoid memory leaks
        previewImages.forEach((preview) => {
          if (preview.url && !preview.id) {
            URL.revokeObjectURL(preview.url);
          }
        });

        // Navigate back
        navigate(-1);
      } else {
        toast.error("Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      toast.error(error.response?.data?.message || "Failed to update post");

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while fetching post data
  if (loadingPost) {
    return (
      <div
        className={`w-full min-h-screen flex items-center justify-center ${
          isDark ? "bg-black text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`w-full min-h-screen ${
        isDark ? "bg-black text-white" : "bg-white text-gray-900"
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(-1)}
            className="text-blue-500 font-medium"
          >
            Cancel
          </button>
          <h1 className="text-xl font-bold">Edit Post</h1>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`text-blue-500 font-semibold ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Preview Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Images</label>

            <div className="grid grid-cols-3 gap-2">
              {previewImages.map((preview, index) => (
                <div
                  key={preview.id || `new-${index}`}
                  className="relative aspect-square"
                >
                  <img
                    src={preview.url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-gray-800 bg-opacity-70 rounded-full p-1"
                  >
                    <XMarkIcon className="w-4 h-4 text-white" />
                  </button>
                </div>
              ))}

              {/* Add Image Button */}
              {existingImages.length + newImages.length < 10 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current.click()}
                  className={`aspect-square border-2 border-dashed flex flex-col items-center justify-center rounded ${
                    isDark
                      ? "border-gray-700 hover:border-gray-500"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <PhotoIcon className="h-8 w-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">Add Image</span>
                </button>
              )}
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              accept="image/*"
              multiple
              className="hidden"
            />

            <p className="mt-2 text-sm text-gray-500">
              You can upload up to 10 images
            </p>
          </div>

          {/* Title Field */}
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium mb-2">
              Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Add a title..."
              className={`w-full px-3 py-2 rounded-md ${
                isDark
                  ? "bg-gray-900 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 border`}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-500">{errors.title}</p>
            )}
          </div>

          {/* Body Field */}
          <div className="mb-4">
            <label htmlFor="body" className="block text-sm font-medium mb-2">
              Content
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="What's on your mind?"
              rows={6}
              className={`w-full px-3 py-2 rounded-md ${
                isDark
                  ? "bg-gray-900 text-white border-gray-700"
                  : "bg-white text-gray-900 border-gray-300"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 border`}
            />
            {errors.body && (
              <p className="mt-1 text-sm text-red-500">{errors.body}</p>
            )}
          </div>

          {/* Hashtags Field */}
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Hashtags</label>

            {/* Display existing hashtags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {hashtags.map((tag, index) => (
                <div
                  key={index}
                  className={`flex items-center rounded-full px-3 py-1 text-sm ${
                    isDark
                      ? "bg-gray-800 text-white"
                      : "bg-gray-200 text-gray-800"
                  }`}
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeHashtag(tag)}
                    className="ml-2"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Hashtag input */}
            <div className="flex">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={handleHashtagKeyDown}
                placeholder="Add hashtags without the # symbol"
                className={`flex-1 px-3 py-2 rounded-l-md ${
                  isDark
                    ? "bg-gray-900 text-white border-gray-700"
                    : "bg-white text-gray-900 border-gray-300"
                } focus:outline-none focus:ring-2 focus:ring-blue-500 border`}
              />
              <button
                type="button"
                onClick={addHashtag}
                className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Press Enter or click + to add a hashtag
            </p>
          </div>

          {/* Private Toggle */}
          <div className="mb-4 flex items-center">
            <input
              id="private"
              type="checkbox"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="h-4 w-4 text-blue-500 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="private" className="ml-2 block text-sm">
              Make this post private
            </label>
          </div>

          {/* Submit Button (for Mobile) */}
          <div className="md:hidden">
            <button
              type="submit"
              disabled={loading}
              className={`w-full px-4 py-2 rounded-md bg-blue-500 text-white font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Saving changes..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPostPage;
