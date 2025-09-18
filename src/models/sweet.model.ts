import mongoose, { Document, Schema } from "mongoose";

export interface ISweet extends Document {
  name: string;
  category: string;
  price: number;
  quantity: number;
  image?: string;
}

const SweetSchema = new Schema<ISweet>({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  image: { type: String },
}, { timestamps: true });

export const Sweet = mongoose.model<ISweet>("Sweet", SweetSchema);
