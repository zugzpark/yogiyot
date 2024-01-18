import express from "express";
import { yogiyotController } from "../controllers/yogiyot.controller.js";
import  { imageUploader, uploadWebImage }from "../utils/aws/imageUploader.js";


const router = express.Router();

const controller = new yogiyotController();

router.get("/", controller.getRestaurants);
router.post("/restaurants/:restaurantId/menus",imageUploader.single('image'),controller.createMenu)

export default router;
