import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import { initializeSocket } from "./src/config/socket.js";
import router from "./src/router/router.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  })
);
app.use(express.json());

// Database Connection
connectDB();

// Routes
app.use(router);

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PATCH"],
    credentials: true,
  })
);

// Initialize Socket.io
initializeSocket(server);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
