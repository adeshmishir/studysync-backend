import express from 'express';
import { protectRoute } from '../middleware/protectRoute.js';
import cloudinary from '../utils/cloudinary.js';
import Note from '../models/Note.js';
import fs from 'fs';

const router = express.Router();

// Upload multiple files to Cloudinary
const uploadFiles = async (files) => {
  const uploaded = [];

  for (const file of files) {
    if (!file.tempFilePath) {
      console.error("❌ tempFilePath missing for file:", file.name);
      continue;
    }

    const isPdf = file.mimetype === 'application/pdf';

    const result = await cloudinary.uploader.upload(file.tempFilePath, {
      resource_type: isPdf ? "raw" : "auto",
      folder: "studysync_notes",
    });

    uploaded.push({
      public_id: result.public_id,
      url: result.secure_url,
      format: result.format,
    });

    fs.unlinkSync(file.tempFilePath); // Clean up temp file
  }

  return uploaded;
};

// POST /api/notes/add - Add a new note
router.post('/add', protectRoute, async (req, res) => {
  try {
    const { title, content, subject, status } = req.body;

    if (!title || !content) {
      return res.status(400).json({ success: false, message: "Missing title or content" });
    }

    let attachments = [];

    if (req.files && req.files.attachments) {
      const files = Array.isArray(req.files.attachments)
        ? req.files.attachments
        : [req.files.attachments];

      attachments = await uploadFiles(files);
    }

    const newNote = await Note.create({
      title,
      content,
      subject,
      status,
      user: req.user._id,
      attachments,
    });

    res.json({ success: true, note: newNote });
  } catch (err) {
    console.error("❌ Server error during note upload:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// GET /api/notes - Get all notes for user
router.get('/', protectRoute, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, notes });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch notes" });
  }
});

// DELETE /api/notes/:id - Delete a note
router.delete('/:id', protectRoute, async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!note) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    res.json({ success: true, message: "Note deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to delete note" });
  }
});

// PUT /api/notes/:id - Update a note
router.put('/:id', protectRoute, async (req, res) => {
  try {
    const existingNote = await Note.findOne({ _id: req.params.id, user: req.user._id });
    if (!existingNote) {
      return res.status(404).json({ success: false, message: "Note not found" });
    }

    const { title, content, subject, status } = req.body;
    let attachments = existingNote.attachments;

    if (req.files && req.files.attachments) {
      const files = Array.isArray(req.files.attachments)
        ? req.files.attachments
        : [req.files.attachments];

      attachments = await uploadFiles(files);
    }

    existingNote.title = title;
    existingNote.content = content;
    existingNote.subject = subject;
    existingNote.status = status;
    existingNote.attachments = attachments;

    const updatedNote = await existingNote.save();

    res.json({ success: true, note: updatedNote });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

export default router;
