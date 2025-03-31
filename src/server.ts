import dotenv from 'dotenv';
import app from './app';
import mongoose from 'mongoose';

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
app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
