import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { Express } from "express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Gateway",
      version: "1.0.0",
      description: "Documentación API",
    },
    components: {
      securitySchemes: {
        bearerAuth: {  // <-- Añade este esquema
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        }
      }
    },
    security: [{  // <-- Añade esto para aplicar por defecto
      bearerAuth: [] 
    }],
  },
  apis: ["./src/routes/*.ts"],
};

const specs = swaggerJsdoc(options);

export function swaggerDocs(app: Express) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));
  console.log(`📚 Swagger en http://localhost:${process.env.PORT || 3000}/api-docs`);
}