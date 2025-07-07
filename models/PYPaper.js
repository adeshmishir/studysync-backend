import mongoose from "mongoose";

const pypaperSchema = new mongoose.Schema(
  {
    subject: {
      type: String,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    semester: {
      type: Number,
      required: true,
    },
    term: {
      type: String,
      enum: ['MidSem', 'EndSem'],
      required: true,
    },
    file: {
      public_id: String,
      url: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Pypaper", pypaperSchema);
