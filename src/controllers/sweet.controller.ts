import { Request, Response } from "express";
import { Sweet } from "../models/sweet.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/cloudinary";

// POST /api/sweets
export const addSweet = asyncHandler(async (req: Request, res: Response) => {
  const { name, category, price, quantity, admins } = req.body;

  if (!name || !category || price == null || quantity == null) {
    throw new ApiError(400, "All fields are required");
  }

  if (!req.file) {
    throw new ApiError(400, "Image is required");
  }

  const cloudinaryRes = await uploadOnCloudinary(req.file.path);
  if (!cloudinaryRes) {
    throw new ApiError(500, "Failed to upload image");
  }

  const existing = await Sweet.findOne({ name });
  if (existing) throw new ApiError(400, "Sweet already exists");

  // admins: expects array of user ObjectIds, or single user
  const sweet = await Sweet.create({
    name,
    category,
    price,
    quantity,
    image: cloudinaryRes.secure_url,
    admins: Array.isArray(admins) ? admins : admins ? [admins] : [],
  });

  res.status(201).json(sweet);
});

// GET /api/sweets
export const listSweets = asyncHandler(async (req, res) => {
  const sweets = await Sweet.find().populate("admins", "name");
  res.json({ success: true, data: sweets });
});


// GET /api/sweets/search
export const searchSweets = asyncHandler(async (req: Request, res: Response) => {
  const { name, category, minPrice, maxPrice, sort, admin } = req.query;
  const filter: any = {};

  if (name) filter.name = { $regex: name as string, $options: "i" };
  if (category) filter.category = { $regex: category as string, $options: "i" };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (admin) {
    filter.admins = admin;
  }

  let sortOption: any = {};
  if (sort === "price_asc") sortOption.price = 1;
  if (sort === "price_desc") sortOption.price = -1;

  const sweets = await Sweet.find(filter).sort(sortOption).populate("admins", "name");
  res.status(200).json(sweets);
});

// PUT /api/sweets/:id
export const updateSweet = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const update: any = { ...req.body };

  // If image is uploaded, replace with Cloudinary URL
  if (req.file?.path) {
    const cloudinaryRes = await uploadOnCloudinary(req.file.path);
    if (!cloudinaryRes) throw new ApiError(500, "Failed to upload image");
    update.image = cloudinaryRes.secure_url;
  }

  // Ensure admins is always an array if present
  if (update.admins) {
    update.admins = Array.isArray(update.admins) ? update.admins : [update.admins];
  }

  const sweet = await Sweet.findByIdAndUpdate(id, update, { new: true }).populate("admins", "name");
  if (!sweet) throw new ApiError(404, "Sweet not found");

  res.status(200).json(sweet);
});


// DELETE /api/sweets/:id
export const deleteSweet = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const sweet = await Sweet.findByIdAndDelete(id);
  if (!sweet) throw new ApiError(404, "Sweet not found");

  res.status(200).json({ message: "Sweet deleted" });
});

// POST /api/sweets/:id/purchase
export const purchaseSweet = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const sweet = await Sweet.findById(id).populate("admins", "name");
  if (!sweet) throw new ApiError(404, "Sweet not found");

  if (sweet.quantity <= 0) throw new ApiError(400, "Out of stock");

  sweet.quantity -= 1;
  await sweet.save();

  res.status(200).json(sweet);
});

// POST /api/sweets/:id/restock
export const restockSweet = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0) throw new ApiError(400, "Invalid restock amount");

  const sweet = await Sweet.findById(id).populate("admins", "name");
  if (!sweet) throw new ApiError(404, "Sweet not found");

  sweet.quantity += amount;
  await sweet.save();

  res.status(200).json(sweet);
});
