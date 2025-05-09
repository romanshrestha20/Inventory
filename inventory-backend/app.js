import express from 'express';
import cors from 'cors';
import productRoutes from './routes/productRoutes.js';
import errorHandler from './middlerwares/errorHandler.js';

const app = express();

app.use(cors());
app.use(express.json());
// Middleware for parsing URL-encoded bodies (if you're using form submissions)
app.use(express.urlencoded({ extended: true }));

app.use('/api/products', productRoutes);
app.use(errorHandler)
app.get('/api/hello', (req, res) => {
  res.status(200).json({ message: 'Hello, World!' });
});

export default app;
