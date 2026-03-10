import mongoose, { Schema, Document } from "mongoose";

export interface IStory extends Document {
  date: Date;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const StorySchema = new Schema<IStory>(
  {
    date: { type: Date, required: true, index: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Story ||
  mongoose.model<IStory>("Story", StorySchema);
