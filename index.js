import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongodbConnection from './utils/mongodbConnection.js';
import userRoute from './mvc/routes/userRoute.js';
import pizzaRoute from './mvc/routes/PizzaRoute.js';

dotenv.config();

// Initialize MongoDB connection
mongodbConnection();

const app = express();
const port = process.env.PORT || 5000;

// Middleware configurations

// CORS configuration
app.use(cors({
    origin: 'https://frontendpizza.vercel.app', 
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Logging with Morgan
app.use(morgan('dev'));

// Cookie parser
app.use(cookieParser());

// Route handling
app.use('/auth', userRoute);
app.use('/pizza', pizzaRoute);

// Health check route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

// Global error handler for unhandled errors
app.use((err, req, res, next) => {
    console.error('Global error handler:', err.stack);
    res.status(500).json({ message: 'An internal server error occurred', success: false });
});

// Start the server
app.listen(port, () => {
    console.log(`Pizza app listening on port ${port}`);
});
