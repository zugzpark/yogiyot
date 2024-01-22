import express from 'express';
import { yogiyotController } from '../controllers/yogiyot.controller.js';
import upload from '../middlewares/uploaderMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js'

const router = express.Router();

const controller = new yogiyotController();



router.get('/', controller.getRestaurants);

//input 요청받은 검색어
router.get('/search/:input', controller.getSuggestions); //검색이랑 목록 url :yogiyot/

//사업장 정보 등록
router.post('/restaurants', controller.createRestaurant);

// //사업장 정보 수정
router.put('/restaurants/:restaurantId', controller.updateRestaurant);

// //사업장 정보 삭제
router.delete('/restaurants/:restaurantId', controller.deleteRestaurant);

router.post("/login", controller.login)
router.post("/signUp",controller.signUp)
router.post("/restaurants/:restaurantId/menus" ,upload.single('image'), controller.createMenu)
router.post("/restaurants/:restaurantId/menus/:menuId/orders",authMiddleware, controller.createOrder)
export default router;
