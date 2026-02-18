const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('Attempting to connect to MongoDB...');
    console.log('Skipping real MongoDB connection for now as it is not available.');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

module.exports = connectDB;
