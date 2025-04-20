import { Router, Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { verifyToken, checkRole } from "../middleware/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Gateway
 *   description: API Gateway para redirigir solicitudes a microservicios
 */

// Middleware para capturar errores del proxy
const errorHandler = (proxyMiddleware: any, errorMessage: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Ejecutamos el middleware del proxy
      await new Promise<void>((resolve, reject) => {
        proxyMiddleware(req, res, (err: any) => {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        });
      });
      // Si no hay error, continuamos
      next();
    } catch (error) {
      console.error(errorMessage, error);
      res.status(503).json({ message: errorMessage });
    }
  };
};

// Configuración del proxy para el Microservicio de Administración
const adminProxy = createProxyMiddleware({
  
  target: process.env.ADMIN_SERVICE_URL , // URL del Microservicio de Administración
  changeOrigin: true,
  pathRewrite: {
    "^/api/admin": "/api", // Reescribe /api/admin a /api
  },
  secure: false, // Cambia a true en producción con certificados válidos
});

// Configuración del proxy para el Microservicio de Consultas
const hospitalProxy = createProxyMiddleware({
  target: process.env.HOSPITAL_SERVICE_URL , // URL del Microservicio de Consultas
  changeOrigin: true,
  pathRewrite: {
    "^/api/hospital": "/api", // Reescribe /api/hospital a /api
  },
  secure: false,
});

// Ruta para el Microservicio de Administración (/api/admin/*)
router.use(
  /^\/admin(\/.*)?$/,
  verifyToken,
  checkRole(["admin"]),
  errorHandler(adminProxy, "Microservicio de Administración no disponible")
);

// Ruta para el Microservicio de Consultas (/api/hospital/*)
router.use(
  /^\/hospital(\/.*)?$/,
  verifyToken,
  checkRole(["general", "admin"]),
  errorHandler(hospitalProxy, "Microservicio de Consultas no disponible")
);


export default router;