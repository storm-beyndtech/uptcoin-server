"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadKycImage = void 0;
const cloudinary_1 = __importDefault(require("./cloudinary"));
const uploadKycImage = async (file) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({
            folder: "kyc-documents",
            resource_type: "image",
            format: "avif",
            quality: "auto:good",
        }, (error, result) => {
            if (error)
                return reject(new Error("Image upload failed."));
            if (result?.secure_url)
                return resolve(result.secure_url);
            reject(new Error("No URL returned from Cloudinary."));
        });
        uploadStream.end(file.buffer); // Send the buffer to Cloudinary
    });
};
exports.uploadKycImage = uploadKycImage;
