// clara-backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3001; // Port for our backend server
const MONGO_URI = 'mongodb://localhost:27017/clara'; // Connection string

// --- Middleware ---
app.use(cors());      // Allow requests from the frontend
app.use(express.json({ limit: '10mb' })); // Parse incoming JSON, increase limit for large analysis objects

// --- MongoDB Connection ---
mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ Successfully connected to local MongoDB'))
  .catch(err => console.error('❌ Error connecting to MongoDB:', err));
  
// --- Mongoose Schema (The structure of our data) ---
// We use { strict: false } to allow any valid JSON structure from Gemini
const recordSchema = new mongoose.Schema({
    analysis: { type: Object, required: true }
}, { timestamps: true }); // `timestamps` adds `createdAt` and `updatedAt` fields

const Record = mongoose.model('Record', recordSchema);

// --- API Routes (Endpoints) ---

// GET /api/records - Fetches all saved records
app.get('/api/records', async (req, res) => {
  try {
    const records = await Record.find().sort({ createdAt: -1 }); // Newest first
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching records', error });
  }
});

// POST /api/records - Saves a new record
app.post('/api/records', async (req, res) => {
  try {
    // The frontend sends the 'analysis' object in the request body
    const newRecord = new Record({ analysis: req.body });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(400).json({ message: 'Error saving record', error });
  }
});

// DELETE /api/records/:id - Deletes a record by its ID
app.delete('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Check if the provided ID is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: 'Invalid record ID' });
    }
    const deletedRecord = await Record.findByIdAndDelete(id);
    if (!deletedRecord) {
      return res.status(404).json({ message: 'Record not found' });
    }
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting record', error });
  }
});

// --- Start the server ---
app.listen(PORT, () => {
  console.log(`🚀 CLARA backend server running on http://localhost:${PORT}`);
});