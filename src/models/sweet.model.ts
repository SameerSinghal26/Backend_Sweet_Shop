import mongoose, { Document, Schema } from "mongoose";

export interface ISweet extends Document {
  name: string;
  category: string;
  price: number;
  quantity: number;
  image?: string;
  admins: mongoose.Types.ObjectId[]; // Array of user/admin references
}

const SweetSchema = new Schema<ISweet>({
  name: { type: String, required: true, unique: true },
  category: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 0, default: 0 },
  image: { type: String },
  admins: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],
}, { timestamps: true });

export const Sweet = mongoose.model<ISweet>("Sweet", SweetSchema);
