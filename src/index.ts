import express, { Request, Response } from 'express';
import cors from 'cors'; // <-- 1. Import CORS
import intakeRoutes from './routes/intake.routes'; 

const app = express();
const PORT = process.env.PORT || 3000;

// <-- 2. Tell Express to use CORS BEFORE any routes
app.use(cors()); 
app.use(express.json());

app.use('/api/intake', intakeRoutes); 

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'success', 
    message: 'Veterinary Intake API is up and running!' 
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/api/health`);
  });
}

export default app;