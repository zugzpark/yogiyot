import express from "express";
import { yogiyotController } from "../controllers/yogiyot.controller.js";

const router = express.Router();

const controller = new yogiyotController();

router.get("/", controller.getRestaurants);

export default router;
