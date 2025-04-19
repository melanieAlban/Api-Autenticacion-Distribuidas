import { Router } from "express";
import { login, register, getAllUsers } from "../controllers/auth.controller";

const authRouter = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación de usuarios
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Token JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: number
 *                     username:
 *                       type: string
 *                     role:
 *                       type: string
 *       400:
 *         description: Datos faltantes
 *       401:
 *         description: Credenciales inválidas
 *       500:
 *         description: Error del servidor
 *  @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [general, admin]
 *                 default: general
 *     responses:
 *       201:
 *         description: Usuario creado
 *       400:
 *         description: Error en la solicitud
 *  @swagger
 * /api/auth/users:
 *   get:
 *     summary: Obtener todos los usuarios (Solo admin)
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de usuarios
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                   username:
 *                     type: string
 *                   role:
 *                     type: string
 *       403:
 *         description: No autorizado
 *       500:
 *         description: Error del servidor
 */
authRouter.post("/login", login);
authRouter.post("/register", async (req, res, next) => {
    try {
        await register(req, res);
    } catch (error) {
        next(error);
    }
});
authRouter.get("/users", getAllUsers);


export default authRouter;