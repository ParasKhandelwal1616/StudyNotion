import express from 'express';

require('dotenv').config();
const app = express();
const PORT = process.env.PORT || 5000;
const dbconnect = require('./config/database');

// Middleware to parse JSON requests
app.use(express.json());