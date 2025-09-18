import { Request, Response, NextFunction } from "express";
import { ApiError } from "../utils/ApiError";

export const adminOnly = (req: Request, _res: Response, next: NextFunction) => {
  const user = (req as any).user;

  if (!user || user.role !== "admin") {
    throw new ApiError(403, "Admin privileges required");
  }

  next();
};
