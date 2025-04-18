export const getLikesFromLocalStorage = () => {
  try {
    const likes = localStorage.getItem("blogLikes");
    return likes ? JSON.parse(likes) : {};
  } catch (error) {
    console.error("Error getting likes from localStorage:", error);
    return {};
  }
};

export const updateLikesInLocalStorage = (blogId, isLiked) => {
  try {
    const likes = getLikesFromLocalStorage();
    likes[blogId] = isLiked;
    localStorage.setItem("blogLikes", JSON.stringify(likes));
  } catch (error) {
    console.error("Error updating likes in localStorage:", error);
  }
};
