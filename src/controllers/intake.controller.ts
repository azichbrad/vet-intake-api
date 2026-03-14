import { Request, Response } from 'express';
import { extractTextFromImage } from '../services/vision.service'; 

export const parseIntakeForm = async (req: Request, res: Response): Promise<void> => {
  try {
    // 1. Verify the file exists
    if (!req.file) {
      res.status(400).json({ 
        status: 'error', 
        message: 'No image file provided. Please upload a valid image.' 
      });
      return;
    }

    console.log(`Processing file: ${req.file.originalname} (${req.file.size} bytes)...`);
    console.log('Sending to Gemini for extraction...');

    // 2. Pass the memory buffer and the file type directly to Gemini
    const extractedData = await extractTextFromImage(req.file.buffer, req.file.mimetype);

    // 3. Return the extracted data to the React UI for human review!
    // (Notice we no longer automatically sync to the PMS here)
    res.status(200).json(extractedData);
      
  } catch (error) {
    console.error('Error in parseIntakeForm:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error during AI extraction. Check your API key and image formatting.' 
    });
  }
};