const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = 3001; // Port for our backend server
const MONGO_URI = 'mongodb://localhost:27017/clara';

// --- Middleware ---
app.use(cors());      
app.use(express.json({ limit: '10mb' }));

mongoose.connect(MONGO_URI)
  .then(() => console.log('Successfully connected to local MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));
  
const recordSchema = new mongoose.Schema({
    analysis: { type: Object, required: true }
}, { timestamps: true }); 

const Record = mongoose.model('Record', recordSchema);

// GET /api/records - Fetches all saved records
app.get('/api/records', async (req, res) => {
  try {
    const records = await Record.find().sort({ createdAt: -1 });
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching records', error });
  }
});

app.post('/api/records', async (req, res) => {
  try {
    const newRecord = new Record({ analysis: req.body });
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(400).json({ message: 'Error saving record', error });
  }
});

app.delete('/api/records/:id', async (req, res) => {
  try {
    const { id } = req.params;
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

app.listen(PORT, () => {
  console.log(`CLARA backend server running on http://localhost:${PORT}`);
});