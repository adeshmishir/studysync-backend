import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import fileUpload from 'express-fileupload';

import connectDB from './utils/db.js';

import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
// import doubtRoutes from './routes/doubtRoutes.js';
import pypRoutes from './routes/pypRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';

dotenv.config();

const app = express();

// ✅ CORS Setup — must come first
// ✅ Manual CORS headers (replace cors middleware)
app.use((req, res, next) => {
  const allowedOrigins = [
    "http://localhost:5173",
    "https://studysync-lilac-psi.vercel.app",
    "studysync-git-main-adesh-mishras-projects-21c6cce4.vercel.app",
    "studysync-drgejb9fc-adesh-mishras-projects-21c6cce4.vercel.app"

  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }

  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, token");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204); // Preflight request
  }

  next();
});


// ✅ Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './tmp'
}));

// ✅ Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
// app.use('/api/ai', doubtRoutes);
app.use('/api/pypapers', pypRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => {
  res.send('StudySync API is running ✅');
});

// ✅ DB Connection + Server Start
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
