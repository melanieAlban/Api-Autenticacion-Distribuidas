import express from "express";
import authRouter from "./routes/auth.route";
import gatewayRouter from "./routes/gateway.route";
import { swaggerDocs } from "./swagger";
import dotenv from "dotenv";
import { AppDataSource } from "./data-source/data-source";
import morgan from "morgan";
import cors from "cors"; // 1. Importa el paquete cors

dotenv.config();

const app = express();

// Middlewares
app.use(morgan("dev"));

// 2. Configuración CORS (¡Colócalo aquí, antes de las rutas!)
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

// Inicializar DB
AppDataSource.initialize()
  .then(() => console.log("Database connected"))
  .catch((error) => console.log("Database error:", error));

// Rutas
app.use("/api/auth",express.json(), authRouter);
app.use("/api", gatewayRouter);

// Swagger
swaggerDocs(app);

// Manejo de errores
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Error interno del servidor" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});