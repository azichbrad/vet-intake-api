import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize the Google Gen AI SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const extractTextFromImage = async (imageBuffer: Buffer, mimeType: string) => {
  // 1. Initialize the model. Gemini 1.5 Flash is lightning fast and excellent at OCR.
  // We explicitly tell it to only return a JSON object.
  const model = genAI.getGenerativeModel({ 
    model: 'gemini-2.5-flash',
    generationConfig: { responseMimeType: 'application/json' }
  });

  // 2. Format the image buffer into the exact structure Gemini expects
  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: mimeType
    }
  };

  // 3. The Prompt locking down the exact JSON schema and rules
  const prompt = `You are a highly accurate medical data extraction assistant.
  Your job is to read handwritten veterinary intake forms and extract the data into a strict JSON object.
  You must return ONLY valid JSON matching this exact structure:
  {
    "status": "success",
    "data": {
      "owner": { "firstName": "", "lastName": "", "phone": "" },
      "patient": { "name": "", "species": "", "breed": "", "age_years": 0 },
      "visitDetails": { "reasonForVisit": "", "currentMedications": [], "allergies": [] }
    },
    "meta": { "confidenceScore": 0.0, "flaggedForReview": false }
  }
  
  Rules:
  - If a field is blank or illegible, leave the string empty or the array empty. Do not invent information.
  - Assess how difficult the handwriting is to read. Set the confidenceScore between 0.0 and 1.0.
  - If the confidenceScore drops below 0.85, you must set flaggedForReview to true.`;

  // 4. Send the prompt and the image to Gemini
  const result = await model.generateContent([prompt, imagePart]);
  const responseText = result.response.text();

  // 5. Parse the raw string back into a usable JSON object
  return JSON.parse(responseText);
};