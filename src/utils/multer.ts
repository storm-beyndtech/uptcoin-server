import multer from "multer";

// ✅ Memory Storage
const storage = multer.memoryStorage();

const upload = multer({
	storage,
	limits: { fileSize: 5 * 1024 * 1024 },
});

export default upload;
