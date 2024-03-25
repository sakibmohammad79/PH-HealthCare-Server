import multer from "multer";
import path from "path";

import { v2 as cloudinary } from "cloudinary";
cloudinary.config({
  cloud_name: "dm126uxmv",
  api_key: "837489542416858",
  api_secret: "CjRNK1KL2gRpBpFVInwjlGZSAmk",
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), "uploads"));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });

const uploadToCloudinary = async (file) => {
  cloudinary.uploader.upload(
    "https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
    { public_id: "olympic_flag" },
    function (error, result) {
      console.log(result);
    }
  );
};

export const fileUploader = {
  upload,
  uploadToCloudinary,
};
