import express from "express";
import dotenv from "dotenv";
import path from "path";
import cors from "cors";

import { connectDB } from "./config/db.js";
import productRoutes from "./routes/product.route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5100;

const __dirname = path.resolve();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//cors middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));

// ✅ Routes
app.use("/api/products", productRoutes);

app.listen(PORT, () => {
	connectDB();
	console.log("Server started at http://localhost:" + PORT);
});
