import dotenv from 'dotenv';
import 'reflect-metadata';
import app from './app';
import mongoose from 'mongoose';

// handle unhandled rejections (promise rejections) globally
process.on('uncaughtException', (err: unknown) => {
  if (err instanceof Error) {
    console.log(err.name, err.message);
  } else {
    console.log('Unknown rejection:', err);
  }
  process.exit(1);
});

// download environment variables from .env file
dotenv.config({ path: '.env' });

if (!process.env.DATABASE) {
  console.error('DATABASE environment variable is missing!');
  process.exit(1);
}

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD || ''
);

mongoose
  .connect(DB)
  .then(() => {
    console.log('DB connection successful!');
  })
  .catch(err => console.error('MongoDB connection error:', err));

// use the environment variable PORT or default to 3000
const port = process.env.PORT || 3000;

// start the server and listen on the specified port
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on('unhandledRejection', (err: unknown) => {
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  if (err instanceof Error) {
    console.log(err.name, err.message);
  } else {
    console.log('Unknown exception:', err);
  }
  server.close(() => {
    process.exit(1);
  });
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully.');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully.');
  server.close(() => {
    console.log('Process terminated');
  });
});
