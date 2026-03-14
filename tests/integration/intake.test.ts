import request from 'supertest';
import path from 'path';
import app from '../../src/index';

describe('Veterinary Intake API Integration Tests', () => {
  
  it('should return a 200 OK from the health check endpoint', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('success');
  });

  it('should return a 400 Bad Request if no image is uploaded', async () => {
    const response = await request(app).post('/api/intake/parse');
    expect(response.status).toBe(400);
    expect(response.body.message).toContain('No image file provided');
  });

  // THE NEW TEST: Simulating the file upload
  it('should process a blank image and return flagged JSON schema', async () => {
    // 1. Tell the test where the dummy image is located
    const imagePath = path.join(__dirname, '../fixtures/blank-form.jpg');

    // 2. Fire the POST request and attach the file using Supertest
    const response = await request(app)
      .post('/api/intake/parse')
      .attach('image', imagePath); // This simulates exactly what Postman does

    // 3. Assert the HTTP status is successful
    expect(response.body.meta.confidenceScore).toBeLessThan(0.85); // Allow slight AI variations

    // 4. Assert the exact JSON structure exists
    expect(response.body.status).toBe('success');
    expect(response.body.data).toHaveProperty('owner');
    expect(response.body.data).toHaveProperty('patient');
    expect(response.body.data).toHaveProperty('visitDetails');

    // 5. Assert that the AI correctly flagged the blank document
    expect(response.body.meta.confidenceScore).toBe(0);
    expect(response.body.meta.flaggedForReview).toBe(true);
    
  }, 10000); // We add a 10-second timeout here because the AI takes a few seconds to reply
});