const express = require("express");
const cors = require("cors");
const routes = require("./routes");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const swaggerJsDoc = require("swagger-jsdoc");
const juspayRoutes = require("../payments/juspay.routes");

const app = express();

// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For HDFC payment gateway callbacks

const corsOptions = {
  origin: ["http://localhost:3000", "http://localhost:4000", "https://bhsfrontend2026.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// SWAGGER DOCS - Must be before API routes
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BHS Backend API",
      version: "1.0.0",
      description: "BHS service platform API",
    },
    servers: [
      { url: "http://localhost:4000/api", description: "Local Server" },
      {
        url: "https://bhs-backend-ou0m.onrender.com/api",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ BearerAuth: [] }],
  },
  apis: ["./src/modules/**/*.js", "./payments/**/*.js"],
};

const swaggerSpec = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API ROUTES
app.use("/api", routes);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
app.use("/api/payment/juspay", juspayRoutes);

module.exports = app;
