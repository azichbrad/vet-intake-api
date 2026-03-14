import { Router } from 'express';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { parseIntakeForm } from '../controllers/intake.controller';

const router = Router();

// Define the POST route. 
// uploadMiddleware.single('image') tells multer to look for a single file 
// attached to the form-data field named "image".
router.post('/parse', uploadMiddleware.single('image'), parseIntakeForm);

export default router;