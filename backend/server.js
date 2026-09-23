import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import productRoutes from "./routes/productRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";

dotenv.config(); // Use port from .env file if available, otherwise use default port 3000

const app = express(); // Main Express application instance
const PORT = process.env.PORT || 3000;

app.use(express.json());// For parsing JSON request bodies
app.use(cors());// For enabling CORS (Frontend can make requests to this backend from a different origin)

app.use(helmet());// For security headers

app.use(morgan("dev"));// For logging HTTP requests to backend console

app.use("/api/products", productRoutes);//Connects request from the frontend to the backend routes in productRoutes.js
app.use("/api/checkout", checkoutRoutes);//Checkout endpoints: validation, sessions, orders

if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
        console.log("Server is running on port " + PORT);
    });
}

export default app;

