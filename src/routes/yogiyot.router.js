import express from "express";
import { yogiyotController } from "../controllers/yogiyot.controller.js";
import upload from '../middlewares/uploaderMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router();

const controller = new yogiyotController();


router.get("/", controller.getRestaurants);

router.post("/login", controller.login)
router.post("/signUp",controller.signUp)
router.post("/restaurants/:restaurantId/menus" ,upload.single('image'), controller.createMenu)
router.post("/restaurants/:restaurantId/menus/:menuId/orders",authMiddleware, controller.createOrder)
export default router;
