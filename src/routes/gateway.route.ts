import { Router } from "express";
import { verifyToken, checkRole } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Gateway
 *   description: Redirección por roles
 */

/**
 * @swagger
 * /api/gateway:
 *   get:
 *     security:  # <-- Requiere autenticación
 *       - bearerAuth: []
 *     summary: Redirección por rol
 *     tags: [Gateway]
 *     responses:
 *       302:
 *         description: Redirección
 */
router.get("/gateway", verifyToken, (req, res) => {
  const user = (req as any).user;

  if (user.role === "admin") {
    res.redirect("http://localhost:3001/admin");
  } else {
    res.redirect("http://localhost:3002/general");
  }
});

export default router;