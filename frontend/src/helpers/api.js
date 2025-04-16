import axios from "axios";
const URL = "http://159.89.22.150:8085/api";
const api = axios.create({
  baseURL: URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false
});

// import ImageUploader from "quill-image-uploader";

api.interceptors.request.use(
  (config) => {
    config.headers.authorization = `Bearer ${
      sessionStorage.getItem("token") || ""
    }`;
    return config;
  },
  (error) => {
    console.log("error while getting token:", error);
    return Promise.reject(error);
  }
);

// const modules = {
//   name: "imageUploader",
//   module: ImageUploader,
//   options: {
//     upload: (file) => {
//       return new Promise((resolve, reject) => {
//         const formData = new FormData();
//         formData.append("image", file);
//         axios
//           .post(`${URL}/api/content/upload`, formData, {
//             headers: {
//               Authorization: `Bearer ${sessionStorage.getItem("token") || ""}`,
//             },
//           })
//           .then((res) => {
//             console.log(res.data);
//             resolve(`${URL}/${res.data}`);
//           })
//           .catch((err) => {
//             reject("Upload failed");
//             console.error("Error:", err);
//           });
//       });
//     },
//   },
// };
// const options = {
//   type: "fade",
//   rewind: true,
// };

export { URL, api};
