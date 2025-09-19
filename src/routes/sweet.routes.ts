import { Router } from "express";
import {
  addSweet,
  listSweets,
  searchSweets,
  updateSweet,
  deleteSweet,
  purchaseSweet,
  restockSweet,
} from "../controllers/sweet.controller";
import { verifyJWT } from "../middlewares/auth.middleware";
import { adminOnly } from "../middlewares/admin.middleware";  
import { upload } from "../middlewares/multer.middleware";

const router = Router();

router.get("/", listSweets);
router.get("/search", searchSweets);

router.post("/", verifyJWT, adminOnly, upload.single("image"), addSweet);
router.put("/:id", verifyJWT, adminOnly, upload.single("image"), updateSweet);
router.delete("/:id", verifyJWT, adminOnly, deleteSweet);

router.post("/:id/purchase", verifyJWT, purchaseSweet);
router.post("/:id/restock", verifyJWT, adminOnly, restockSweet);

export default router;
