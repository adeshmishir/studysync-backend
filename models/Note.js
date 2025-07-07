import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  subject: { type: String },
  status: { type: String, enum: ["Pending", "Understood", "Revisit"], default: "Pending" },
  attachments: [
    {
      public_id: String,
      url: String,
      format: String,
    }
  ],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.model("Note", noteSchema);
