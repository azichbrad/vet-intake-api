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
  const prompt = `You are an expert veterinary data extraction AI. Analyze this veterinary intake form and extract the information into the EXACT JSON structure below. 

If a field is illegible, empty, or not present on the form, use null or an empty string "". Do not make up information. If the handwriting is very difficult to read, set "flaggedForReview" to true.

RETURN ONLY VALID JSON. NO MARKDOWN. NO BACKTICKS.

{
  "status": "success",
  "data": {
    "owner": {
      "firstName": "",
      "lastName": "",
      "phone": "",
      "email": "",
      "address": ""
    },
    "patient": {
      "name": "",
      "species": "",
      "breed": "",
      "age": "",
      "sex": "",
      "spayedNeutered": null,
      "colorMarkings": ""
    },
    "visitDetails": {
      "reasonForVisit": "",
      "currentMedications": [],
      "allergies": [],
      "previousClinic": ""
    }
  },
  "meta": {
    "flaggedForReview": false
  }
}`;

  // 4. Send the prompt and the image to Gemini
  const result = await model.generateContent([prompt, imagePart]);
  const responseText = result.response.text();

  // 5. Parse the raw string back into a usable JSON object
  return JSON.parse(responseText);
};