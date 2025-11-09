# CLARA: Local MongoDB Persistence Guide

This guide explains how to switch CLARA from using temporary browser storage to a persistent, local MongoDB database.

## 1. Why a Backend Server is Required

A web browser, for critical security reasons, **cannot connect directly to a database like MongoDB**. To bridge this gap, we need a middleman: a **backend server**. This server runs locally on your machine, receives requests from the CLARA frontend, and securely communicates with your local database.

**Local Workflow:**
`Frontend (CLARA App)` <--> `Backend Server (Node.js)` <--> `Database (MongoDB)`

---

## 2. Step-by-Step Setup

### Step 1: Install and Run MongoDB with Docker

Docker is the simplest and most reliable way to run a database on your machine.

1.  **[Install Docker Desktop](https://docs.docker.com/get-docker/)** for your operating system (Mac, Windows, or Linux) and ensure it is running.

2.  Open your terminal (Command Prompt, PowerShell, or Terminal) and run this single command to download and start a MongoDB container:
    ```bash
    docker run --name clara-mongo -p 27017:27017 -d mongo
    ```
    *   `--name clara-mongo`: Gives the container a memorable name.
    *   `-p 27017:27017`: Maps the database port to your local machine.
    *   `-d`: Runs the container in the background.

3.  **Verify it's running** by typing `docker ps`. You should see `clara-mongo` in the list of running containers. Your database is now ready.

### Step 2: Set Up the Node.js Backend Server

This server will listen for requests from the CLARA app and manage the data in your database.

1.  **Create a new folder** for your server, completely separate from the CLARA frontend code. Let's call it `clara-backend`.
    ```bash
    mkdir clara-backend
    cd clara-backend
    ```

2.  **Initialize a Node.js project** inside the new folder.
    ```bash
    npm init -y
    ```

3.  **Install the necessary packages:**
    *   `express`: The web server framework.
    *   `mongoose`: A tool to easily interact with MongoDB.
    *   `cors`: Middleware to allow requests from your frontend.
    ```bash
    npm install express mongoose cors
    ```

4.  **Create a server file** named `server.js` in the `clara-backend` folder. Paste the following code into it:

    ```javascript
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
    ```

5.  **Start your backend server.** In your terminal, from inside the `clara-backend` directory, run:
    ```bash
    node server.js
    ```
    You should see the "server running" message. **Keep this terminal window open.** Your backend is now live and listening for requests.

### Step 3: Verify Frontend Code is Ready

The `index.js` file in the CLARA project has already been updated to communicate with this backend server. You can verify that the `API & RECORDS LOGIC` section contains `fetch` calls to `http://localhost:3001/api/records`. No changes are needed from you.

---

## 3. Running the Full Application

To use the application with your new local database, you must have **two** processes running in **two separate terminal windows**:

1.  **Terminal 1 (Frontend):**
    *   Navigate to your CLARA frontend project directory.
    *   Run `serve` to start the web interface.
    *   Access it at `http://localhost:3000` (or the URL `serve` provides).

2.  **Terminal 2 (Backend):**
    *   Navigate to your `clara-backend` directory.
    *   Run `node server.js` to start your API server.
    *   Keep this running in the background.

Now, when you use the "Patient Records" tab in CLARA, all data will be saved to and loaded from your local MongoDB database, providing true persistence.