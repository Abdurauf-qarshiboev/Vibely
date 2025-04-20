import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/helpers/api";
import { useTheme } from "@/context/ThemeContext";
import { XMarkIcon, PlusIcon, PhotoIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

const CreatePostsPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const fileInputRef = useRef(null);

  // Form state
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [hashtagInput, setHashtagInput] = useState("");
  const [hashtags, setHashtags] = useState([]);
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + images.length > 10) {
      toast.error("You can only upload up to 10 images");
      return;
    }

    // Add new images to existing ones
    setImages((prevImages) => [...prevImages, ...files]);

    // Create preview URLs for the images
    const newPreviewImages = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setPreviewImages((prevPreviews) => [...prevPreviews, ...newPreviewImages]);
  };

  // Remove an image from the selection
  const removeImage = (index) => {
    // Create new arrays without the removed image
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previewImages];

    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(newPreviews[index].url);
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
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
        hashtags, // This array contains hashtags without # symbol
      };

      formData.append("request", JSON.stringify(postData));

      // Add images
      images.forEach((image) => {
        formData.append("image", image);
      });

      // Send the request
      const response = await api.post("/posts", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });


      if (response.data && response.data.success) {
        toast.success("Post created successfully!");
        // Clean up preview image URLs to avoid memory leaks
        previewImages.forEach((preview) => {
          URL.revokeObjectURL(preview.url);
        });

        // Redirect to the profile page or feed
        navigate(-1);
      } else {
        toast.error("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error(error.response?.data?.message || "Failed to create post");

      if (error.response?.data?.errors) {
        setErrors(error.response.data.errors);
      }
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="text-xl font-bold">Create New Post</h1>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`text-blue-500 font-semibold ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Posting..." : "Share"}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Preview Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Images</label>

            <div className="grid grid-cols-3 gap-2">
              {previewImages.map((preview, index) => (
                <div key={index} className="relative aspect-square">
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
              {images.length < 10 && (
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
              {loading ? "Creating post..." : "Create Post"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostsPage;
