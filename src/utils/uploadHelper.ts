import cloudinary from "./cloudinary";

export const uploadKycImage = async (file: Express.Multer.File): Promise<string> => {
	return new Promise((resolve, reject) => {
		const uploadStream = cloudinary.uploader.upload_stream(
			{
				folder: "kyc-documents",
				resource_type: "image",
				format: "avif",
				quality: "auto:good",
			},
			(error, result) => {
				if (error) return reject(new Error("Image upload failed."));
				if (result?.secure_url) return resolve(result.secure_url);
				reject(new Error("No URL returned from Cloudinary."));
			}
		);

		uploadStream.end(file.buffer); // Send the buffer to Cloudinary
	});
};
