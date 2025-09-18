import { Request, Response } from "express";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import jwt, { SignOptions } from "jsonwebtoken";
import ms from "ms";

const generateToken = (userId: string) => {
  const options: SignOptions = {
    expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || "1d") as ms.StringValue,
  };

  return jwt.sign(
    { _id: userId },
    process.env.ACCESS_TOKEN_SECRET as string,
    options
  );
};

// POST /api/auth/register
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) throw new ApiError(400, "Email already registered");

  const user = await User.create({
    name, 
    email, 
    password,
    role : role || "user"
  });
  const token = generateToken(user._id.toString());

  res
    .status(201)
    .json(new ApiResponse(201, { user, token }, "User registered successfully"));
});

// POST /api/auth/login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "Invalid credentials");

  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new ApiError(400, "Invalid credentials");

  const token = generateToken(user._id.toString());

  res
    .status(200)
    .json(new ApiResponse(200, { user, token }, "Login successful"));
});
