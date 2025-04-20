import { Router, Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { verifyToken, checkRole } from "../middleware/auth.middleware";

const router = Router();

const errorHandler = (proxyMiddleware: any, errorMessage: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await new Promise<void>((resolve, reject) => {
        proxyMiddleware(req, res, (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      next();
    } catch (error) {
      console.error(errorMessage, error);
      res.status(503).json({ message: errorMessage });
    }
  };
};

const adminProxy = createProxyMiddleware({
  target: process.env.ADMIN_SERVICE_URL || "http://localhost:3001",
  changeOrigin: true,
  pathRewrite: {
    "^/api/admin": "/api",
  },
  secure: false,
});

const hospitalProxy = createProxyMiddleware({
  target: process.env.HOSPITAL_SERVICE_URL || "http://localhost:3002",
  changeOrigin: true,
  pathRewrite: {
    "^/api/hospital": "/api",
  },
  secure: false,
});

router.use(
  "/admin",
  verifyToken,
  checkRole(["admin"]),
  errorHandler(adminProxy, "Microservicio de Administración no disponible")
);

router.use(
  "/hospital",
  verifyToken,
  checkRole(["general", "admin"]),
  errorHandler(hospitalProxy, "Microservicio de Consultas no disponible")
);

export default router;