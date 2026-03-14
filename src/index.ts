import express, { Request, Response } from 'express';
import intakeRoutes from './routes/intake.routes'; // <-- ADD THIS IMPORT

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// --> ADD THIS LINE: Mount the intake routes under the /api/intake path
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