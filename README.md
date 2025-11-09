# CLARA: Local Development Guide

This guide explains how to set up and run the CLARA (Clinical Language and Reasoning Assistant) project on your local machine.

## Overview

CLARA is an intelligent, client-side web application that uses Google's Gemini API to analyze unstructured clinical transcripts. It features two modes:

*   **Transcript Analysis:** Provides a structured, interactive dashboard with key medical entities, ICD-10 codes, risk assessments, and actionable next steps.
*   **Live Conversation:** Simulates a real-time patient interview using voice input and output, generating a transcript that can then be analyzed.

The application is built with vanilla JavaScript (ES modules) and Tailwind CSS, and it runs entirely in your browser.

## Prerequisites

*   **A Google Gemini API Key:** You can get one for free from [Google AI Studio](https://aistudio.google.com/app/apikey).
*   **A local web server:** This is required to serve the files correctly. We recommend using `serve`, a simple command-line tool.

---

## 🚀 Running the Application (3 Steps)

### Step 1: Configure Your API Key

The application needs your Google Gemini API key to function. This is done by creating and configuring a local `env.js` file.

1.  In the project's root directory, find the file named `env.js.example`.

2.  **Make a copy** of this file and **rename the copy** to `env.js`.

3.  Open your new `env.js` file with a text editor. You will see the following content:
    ```javascript
    // This file configures your Gemini API key for local development.
    // IMPORTANT: DO NOT share this file or commit it to a public repository.
    window.process = {
      env: {
        API_KEY: 'PASTE_YOUR_GEMINI_API_KEY_HERE'
      }
    };
    ```

4.  Replace the placeholder `PASTE_YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key.

    **Example:** If your API key is `AbCdEfGhIjKlMnOpQrStUvWxYz`, your `env.js` file should look like this:
    ```javascript
    // This file configures your Gemini API key for local development.
    // IMPORTANT: DO NOT share this file or commit it to a public repository.
    window.process = {
      env: {
        API_KEY: 'AbCdEfGhIjKlMnOpQrStUvWxYz'
      }
    };
    ```
5. Save the `env.js` file.

### Step 2: Install the Web Server

If you don't have the `serve` package installed globally, open your terminal and run this command. You only need to do this once.

```bash
npm install -g serve
```

### Step 3: Start the Server

1.  In your terminal, make sure you are in the project's root directory (the same folder that contains `index.html`).
2.  Start the local web server by running the following command:

    ```bash
    serve
    ```

3.  The server will start and give you a local URL, typically `http://localhost:3000`.
4.  Open this URL in your web browser.

You should now see the CLARA application running successfully!

---

## 🗄️ Enabling Data Persistence with MongoDB (Optional)

By default, CLARA runs entirely in your browser and does not save your analysis results permanently. To enable saving patient records to a persistent local database, you need to set up a local MongoDB instance and a simple backend server.

### How It Works

For security reasons, a web browser cannot connect directly to a database. To save your records, CLARA communicates with a small **local backend server** which you will run on your machine. This server is the only part of the system that connects to your MongoDB database.

**The data flow is:** `CLARA App (Frontend)` ↔️ `Local Backend Server` ↔️ `Your MongoDB Database`

**For complete, step-by-step instructions on how to set up both the database and the required backend, please refer to the dedicated guide:**

➡️ **[View the MongoDB Persistence Guide](./mongo.md)**

---

## ✅ How to Verify Data is Saved in MongoDB

Once you have followed the `mongo.md` guide and have the database and backend server running, you can verify that records are being saved correctly using one of the following methods.

### Method 1: Using MongoDB Compass (Recommended GUI)

MongoDB Compass is a graphical user interface that makes it easy to view and manage your database.

1.  **[Download and install MongoDB Compass](https://www.mongodb.com/try/download/compass)**.
2.  Open Compass and connect to your local database. The default connection string is:
    ```
    mongodb://localhost:27017/
    ```
3.  After connecting, you will see a list of databases on the left. Click on the **`clara`** database.
4.  Inside the `clara` database, click on the **`records`** collection.
5.  The main panel will now display all the patient records you have saved from the application. Each document will contain the full `analysis` JSON object and timestamps.

### Method 2: Using the Command Line (Mongo Shell)

If you prefer using the terminal and have followed the Docker setup in `mongo.md`:

1.  Open a new terminal window.
2.  Access the running Docker container's shell:
    ```bash
    docker exec -it clara-mongo mongosh
    ```
3.  You are now inside the MongoDB shell. First, switch to the `clara` database:
    ```
    use clara
    ```
4.  Now, query the `records` collection to find all documents. The `.pretty()` method formats the output nicely.
    ```
    db.records.find().pretty()
    ```
5.  This command will print out all the saved records directly in your terminal.

---

## 💡 Troubleshooting

*   **Blank Screen or "process is not defined" Error:** This usually means the `env.js` file is missing, named incorrectly, or has a syntax error. Double-check that you have correctly created `env.js` from the example file and that its content matches the example above.
*   **"404 Not Found" Error:** This means the server cannot find the project files. Make sure you are running the `serve` command from the project's root directory.
*   **"API Key not configured" Error:** This error appears in the app if the `API_KEY` inside `env.js` is still the placeholder text. Make sure you have pasted your actual key into the file.
*   **"Could not load records" Error on Patient Records page:** This means the frontend cannot connect to your local backend server. Ensure you have the Node.js server running in a separate terminal as described in `mongo.md`.