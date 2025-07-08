import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

import connectDB from './utils/db.js';

import authRoutes from './routes/authRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
// import doubtRoutes from './routes/doubtRoutes.js';
import pypRoutes from './routes/pypRoutes.js'; // ✅ Correct path name
import attendanceRoutes from './routes/attendanceRoutes.js';



dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowedOrigins = ["http://localhost:5173", "https://studysync.vercel.app"];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
import fileUpload from 'express-fileupload';

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: './tmp'
}));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);
// app.use('/api/ai', doubtRoutes);
app.use('/api/pypapers', pypRoutes);
app.use('/api/attendance', attendanceRoutes);

app.get('/', (req, res) => {
  res.send('StudySync API is running ✅');
});

// Connect DB and Start Server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
});
