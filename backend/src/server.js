//const express = require('express');
import express from 'express';
import dotenv from 'dotenv';
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);         // Converts the current file URL (like "file:///E:/Chat-APP/backend/src/server.js") to a regular path ("E:\Chat-APP\backend\src\server.js")
const __dirname = path.dirname(__filename);                 // Extracts the directory name from the file path ("E:\Chat-APP\backend\src")
dotenv.config({ path: path.resolve(__dirname, '../.env') });      // Loads environment variables from the .env file in the root directory ("E:\Chat-APP\.env")

const app = express();

const PORT = process.env.PORT || 3000;

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

console.log("NODE_ENV: ", process.env.NODE_ENV);

//make ready for deployement 
if(process.env.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, '../../frontend/dist')));
    app.get('*', (_, res) => {
        res.sendFile(path.join(__dirname, "../../frontend","dist","index.html"));
    });
}

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
});