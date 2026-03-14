import multer from 'multer';

// We use memory storage here instead of disk storage. 
// Why? Because when you eventually deploy this to Google Cloud Run (a serverless environment), 
// writing files to the local disk can cause memory leaks. We just need to hold the image 
// in memory long enough to pass it to the AI Vision API.
const storage = multer.memoryStorage();

// Configure the upload limits and file validation
export const uploadMiddleware = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB limit per image (plenty for a standard iPad photo)
  },
  fileFilter: (req, file, cb) => {
    // We only want to accept standard image formats. No PDFs or weird files yet!
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and WEBP images are allowed.'));
    }
  },
});