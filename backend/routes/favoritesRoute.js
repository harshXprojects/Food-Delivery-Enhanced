import express from "express";
import authMiddleware from "../middleware/auth.js";
import { toggleFavorite, getFavorites } from "../controllers/favoritesController.js";

const favoritesRouter = express.Router();

favoritesRouter.post("/toggle", authMiddleware, toggleFavorite);
favoritesRouter.post("/get", authMiddleware, getFavorites);

export default favoritesRouter;
