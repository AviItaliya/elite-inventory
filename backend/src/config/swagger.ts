import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Elite Inventory API",
      version: "1.0.0",
      description:
        "API documentation for the Elite Inventory inventory-management system.",
    },
    servers: [
      {
        url: process.env.SWAGGER_SERVER_URL || "http://localhost:1213",
        description: "Configured API server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    "./src/routes/*.ts",
    "./dist/routes/*.js",
  ],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;