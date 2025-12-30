import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import userRoute from "./routes/userRoute.js";
import authRoute from "./routes/authRoute.js";
import adminRoute from './routes/adminRoute.js'
import vendorRoute from './routes/venderRoute.js'
import testRoute from './routes/testRoute.js'

import cors from 'cors'
import cookieParser from "cookie-parser";
import { cloudinaryConfig } from "./utils/cloudinaryConfig.js";
import { startQueueProcessor } from "./services/offlineQueueService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from the correct path
dotenv.config({ path: path.join(__dirname, '.env') });

const App = express();

App.use(express.json());
App.use(cookieParser())

// Serve static files for uploaded images
App.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve static files for offline PDFs
App.use('/offline-pdfs', express.static(path.join(__dirname, 'offline-pdfs')));

const port = process.env.PORT || 3000;

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('MONGO_URI:', process.env.MONGO_URI ? 'Found' : 'Not found');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Found' : 'Not found');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Found' : 'Not found');
console.log('ACCESS_TOKEN:', process.env.ACCESS_TOKEN ? 'Found' : 'Not found');
console.log('REFRESH_TOKEN:', process.env.REFRESH_TOKEN ? 'Found' : 'Not found');

// MongoDB connection with improved error handling and optimized settings
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Connection timeout settings
      serverSelectionTimeoutMS: 60000, // 60 seconds
      socketTimeoutMS: 60000, // 60 seconds
      connectTimeoutMS: 60000, // 60 seconds
      
      // Connection pool settings
      maxPoolSize: 20, // Increased pool size
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      
      // Retry settings
      retryWrites: true,
      retryReads: true,
    });
    
    console.log(`MongoDB connected successfully: ${conn.connection.host}`);
    
    // Set mongoose buffer settings (only valid options)
    mongoose.set('bufferCommands', false);
    
    // Start offline queue processor after DB connection
    console.log("🔄 Starting offline queue processor...");
    startQueueProcessor();
    
    return conn;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.error("Retrying connection in 10 seconds...");
    setTimeout(connectDB, 10000);
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
  // Attempt to reconnect
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
  // Attempt to reconnect
  setTimeout(connectDB, 5000);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    process.exit(1);
  }
});

// Connect to database
connectDB();

App.listen(port, () => {
  console.log(`server listening on port ${port}!`);
});

const allowedOrigins = [
  'https://rent-a-ride-two.vercel.app', 
  'https://your-production-frontend.com',
  'https://your-netlify-app.netlify.app', // Add your Netlify domain here
  'http://localhost:5173', // Vite dev server
  'http://localhost:3000', // Backend server
  'http://127.0.0.1:5173'  // Alternative localhost
]; // Production and development URLs

App.use(
  cors({
    origin: allowedOrigins,
    methods:['GET', 'PUT', 'POST' ,'PATCH','DELETE'],
    credentials: true, // Enables the Access-Control-Allow-Credentials header
  })
);

// Test route for frontend connection
App.get('/api/test', (req, res) => {
  res.json({ 
    message: 'Backend connected successfully!', 
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// Database health check route
App.get('/api/health', async (req, res) => {
  try {
    const { checkDatabaseHealth, getConnectionState } = await import('./utils/dbHealthCheck.js');
    
    const dbHealth = await checkDatabaseHealth();
    const connectionState = getConnectionState();
    
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      database: dbHealth,
      connection: connectionState,
      uptime: process.uptime()
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

App.use('*', cloudinaryConfig);

// App.get('/*', (req, res) => res.sendFile(resolve(__dirname, '../public/index.html')));

App.use("/api/user", userRoute);
App.use("/api/auth", authRoute);
App.use("/api/admin",adminRoute);
App.use("/api/vendor",vendorRoute);
App.use("/api/test", testRoute);

App.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "internal server error";
  return res.status(statusCode).json({
    succes: false,
    message,
    statusCode,
  });
});
