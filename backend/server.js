import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

import productRoutes from "./routes/productRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());// For parsing JSON request bodies
app.use(cors());// For enabling CORS

app.use(helmet());// For security headers

app.use(morgan("dev"));// For logging HTTP requests

app.use("/api/products", productRoutes);

app.listen(PORT, () => {
    console.log("Server is running on port " + PORT);
});