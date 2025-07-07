import express from "express";
import Attendance from "../models/Attendance.js";
import { protectRoute } from "../middleware/protectRoute.js";

const router = express.Router();

// Add a new subject
router.post("/add-subject", protectRoute, async (req, res) => {
  try {
    const { subject } = req.body;

    if (!subject) {
      return res.status(400).json({ success: false, message: "Subject is required" });
    }

    const newRecord = new Attendance({
      userId: req.user._id,
      subject,
    });

    await newRecord.save();
    res.status(201).json({ success: true, data: newRecord });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Mark attendance (Present/Absent/Undo)
router.patch("/mark/:id", protectRoute, async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    const record = await Attendance.findOne({ _id: id, userId: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });

    if (status === "Undo") {
      const lastEntry = record.history.pop();
      if (!lastEntry) return res.status(400).json({ success: false, message: "No history to undo" });

      record.totalClasses--;
      if (lastEntry.status === "Present") {
        record.attendedClasses--;
      }
    } else {
      if (!["Present", "Absent"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status" });
      }

      record.totalClasses++;
      if (status === "Present") record.attendedClasses++;
      record.history.push({ status });
    }

    await record.save();
    res.json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Get all attendance records for user
router.get("/", protectRoute, async (req, res) => {
  try {
    const records = await Attendance.find({ userId: req.user._id }).sort("subject");
    res.json({ success: true, data: records });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Delete a subject
router.delete("/:id", protectRoute, async (req, res) => {
  try {
    const record = await Attendance.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!record) return res.status(404).json({ success: false, message: "Record not found" });
    res.json({ success: true, message: "Subject deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PATCH /edit/:id – Edit subject name
router.patch("/edit/:id", protectRoute, async (req, res) => {
  try {
    const { subject } = req.body;

    if (!subject?.trim()) {
      return res.status(400).json({ success: false, message: "Subject name is required" });
    }

    const updated = await Attendance.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { subject },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ success: false, message: "Subject not found" });
    }

    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});



export default router;
