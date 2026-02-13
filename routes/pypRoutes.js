import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import cloudinary from "../utils/cloudinary.js";
import Pypaper from "../models/PYPaper.js";

const router = express.Router();

// ✅ Upload PYP (Admin only, base64 upload - no multer)
router.post("/upload", protectRoute, async (req, res) => {
  try {
    const { subject, year, semester, term, fileBase64 } = req.body;

    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can upload papers" });
    }

    if (!subject || !year || !semester || !term || !fileBase64) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
        received: { subject, year, semester, term, fileBase64Exists: !!fileBase64 }
      });
    }

    const result = await cloudinary.uploader.upload(fileBase64, {
      resource_type: "raw", // required for PDF uploads
      type: "upload", 
      folder: "studysync_pyp"
    });

    const newPaper = await Pypaper.create({
      subject,
      year,
      semester,
      term,
      file: {
        public_id: result.public_id,
        url: result.secure_url,
      },
    });

    res.json({ success: true, paper: newPaper });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
});

// ✅ Get all PYPs (Anyone)
router.get("/", protectRoute, async (req, res) => {
  try {
    const papers = await Pypaper.find().sort({ createdAt: -1 });
    res.json({ success: true, papers });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch papers" });
  }
});

// ✅ Delete a PYP (Admin only)
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Only admin can delete papers" });
    }

    const paper = await Pypaper.findByIdAndDelete(req.params.id);
    if (!paper) {
      return res.status(404).json({ success: false, message: "Paper not found" });
    }

    if (paper.file?.public_id) {
      await cloudinary.uploader.destroy(paper.file.public_id, {
        resource_type: "raw"
      });
    }

    res.json({ success: true, message: "Paper deleted" });
  } catch (err) {
    console.error("❌ Delete error:", err);
    res.status(500).json({ success: false, message: "Delete failed", error: err.message });
  }
});

export default router;
