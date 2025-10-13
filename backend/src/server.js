//const express = require('express');
import express from 'express';
import {ENV} from "./lib/env.js";
import authRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import path from 'path';
import { fileURLToPath } from 'url';
import { connectToDB } from './lib/db.js';
import cookieParser from "cookie-parser";


const __filename = fileURLToPath(import.meta.url);         // Converts the current file URL (like "file:///E:/Chat-APP/backend/src/server.js") to a regular path ("E:\Chat-APP\backend\src\server.js")
const __dirname = path.dirname(__filename);                 // Extracts the directory name from the file path ("E:\Chat-APP\backend\src")

const app = express();

const PORT = ENV.PORT || 3000;

app.use(express.json());  //req.body
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

//make ready for deployement 
if(ENV.NODE_ENV === 'production'){
    app.use(express.static(path.join(__dirname, '../../frontend/dist')));
    app.get('*', (_, res) => {
        res.sendFile(path.join(__dirname, "../../frontend","dist","index.html"));
    });
}

app.listen(PORT, () => {
    console.log('Server is running on port ' + PORT);
    connectToDB();
});