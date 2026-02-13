import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  subject: { type: String, required: true },
  attendedClasses: { type: Number, default: 0 },
  totalClasses: { type: Number, default: 0 },
  history: [
    {
      status: { type: String, enum: ["Present", "Absent"], required: true },
      date: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.model("Attendance", attendanceSchema);
