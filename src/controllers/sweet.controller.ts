import { Request, Response } from "express";
import { Sweet } from "../models/sweet.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

// POST /api/sweets
export const addSweet = asyncHandler(async (req: Request, res: Response) => {
  const { name, category, price, quantity, image } = req.body;

  if (!name || !category || price == null || quantity == null) {
    throw new ApiError(400, "All fields are required");
  }

  const existing = await Sweet.findOne({ name });
  if (existing) throw new ApiError(400, "Sweet already exists");

  const sweet = await Sweet.create({ name, category, price, quantity, image });
  res.status(201).json(sweet);
});

// GET /api/sweets
export const listSweets = asyncHandler(async (_req: Request, res: Response) => {
  const sweets = await Sweet.find();
  res.status(200).json(sweets);
});

// GET /api/sweets/search
export const searchSweets = asyncHandler(async (req: Request, res: Response) => {
  const { name, category, minPrice, maxPrice } = req.query;
  const filter: any = {};

  if (name) filter.name = { $regex: name as string, $options: "i" };
  if (category) filter.category = { $regex: category as string, $options: "i" };
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sweets = await Sweet.find(filter);
  res.status(200).json(sweets);
});

// PUT /api/sweets/:id
export const updateSweet = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const update = req.body;

  const sweet = await Sweet.findByIdAndUpdate(id, update, { new: true });
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

  const sweet = await Sweet.findById(id);
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

  const sweet = await Sweet.findById(id);
  if (!sweet) throw new ApiError(404, "Sweet not found");

  sweet.quantity += amount;
  await sweet.save();

  res.status(200).json(sweet);
});
