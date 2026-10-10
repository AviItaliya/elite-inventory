import swaggerJSDoc from "swagger-jsdoc";

const options: swaggerJSDoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Elite Inventory API",
      version: "1.0.0",
      description: "Inventory and Order Management API",
    },
    servers: [
      {
        url: "http://localhost:1213",
      },
    ],
  },

  apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;