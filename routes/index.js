import express from "express";
import funlearnRoutes from "./funlearn.js";

const router = express.Router();

// Use FUNLEARN routes
router.use("/", funlearnRoutes);

export default router;
