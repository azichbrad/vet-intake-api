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

    // ==========================================
    // 🚀 THE INTEGRATION LAYER (PMS SYNC)
    // ==========================================
    try {
      // 👇 Paste your actual Webhook.site URL right here!
      const pmsWebhookUrl = 'https://webhook.site/d3b1bc3c-7feb-491c-8d81-758a7eb474fd'; 
      
      console.log('Forwarding extracted data to Practice Management System...');
      
      const syncResponse = await fetch(pmsWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Eventually: 'Authorization': `Bearer ${clinic.ezyVetToken}`
        },
        body: JSON.stringify({
          source: 'Vet Intake Scanner UI',
          timestamp: new Date().toISOString(),
          patientData: extractedData // Fixed: Using your actual variable name!
        })
      });

      if (syncResponse.ok) {
        console.log(`✅ Successfully synced with PMS (Status: ${syncResponse.status})`);
      } else {
        console.warn(`⚠️ PMS Sync failed with status: ${syncResponse.status}`);
      }
    } catch (syncError) {
      // Catch the error so if the clinic's PMS goes down, the app doesn't crash
      console.error('Failed to communicate with PMS:', syncError);
    }
    // ==========================================

    // 3. Finally, return the data to the iPad UI as usual
    res.status(200).json(extractedData);
      
  } catch (error) {
    console.error('Error in parseIntakeForm:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Internal server error during AI extraction. Check your API key and image formatting.' 
    });
  }
};