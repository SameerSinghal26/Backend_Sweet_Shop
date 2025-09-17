import { Router } from "express";
import { registerUser, loginUser } from "../controllers/auth.controller";
import { ApiError } from "../utils/ApiError";
import { Request, Response, NextFunction } from "express";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);

// ✅ Error handler (all 4 params, in correct order)
router.use(function (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      success: err.success,
      message: err.message,
      errors: err.errors,
      data: err.data,
    });
  }

  console.error(err);
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

export default router;
