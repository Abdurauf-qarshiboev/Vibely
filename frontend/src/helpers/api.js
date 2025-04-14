import axios from "axios";
const URL = "http://195.158.9.124:4104";
const api = axios.create({
  baseURL: URL,
});

import ImageUploader from "quill-image-uploader";

api.interceptors.request.use(
  (config) => {
    config.headers.authorization = `Bearer ${
      sessionStorage.getItem("token") || ""
    }`;
    // config.headers['Content-Type'] = 'multipart/form-data'
    return config;
  },
  (error) => {
    console.log("eeerrr", error);
    return Promise.reject(error);
  }
);

const modules = {
  name: "imageUploader",
  module: ImageUploader,
  options: {
    upload: (file) => {
      return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append("image", file);
        axios
          .post(`${URL}/api/content/upload`, formData, {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem("token") || ""}`,
            },
          })
          .then((res) => {
            console.log(res.data);
            resolve(`${URL}/${res.data}`);
          })
          .catch((err) => {
            reject("Upload failed");
            console.error("Error:", err);
          });
      });
    },
  },
};
const options = {
  type: "fade",
  rewind: true,
};

export { URL, api, modules, options };
