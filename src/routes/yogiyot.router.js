import express from 'express';
import { yogiyotController } from '../controllers/yogiyot.controller.js';
import upload from '../middlewares/uploaderMiddleware.js';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

const controller = new yogiyotController();



router.get('/', controller.getRestaurants);

//로그인
router.post('/login', controller.login);

//회원가입
router.post('/signUp', controller.signUp);

//input 요청받은 검색어
router.get('/search/:input', controller.getSuggestions);

//사업장 정보 등록
router.post('/restaurants',authMiddleware, controller.createRestaurant);

//사업장 정보 수정
router.put('/restaurants/:restaurantId',authMiddleware, controller.updateRestaurant);

//사업장 정보 삭제
router.delete('/restaurants/:restaurantId',authMiddleware, controller.deleteRestaurant);

//메뉴등록
router.post('/restaurants/:restaurantId/menus', authMiddleware, upload.single('image'), controller.createMenu);

//주문 등록
router.post('/restaurants/:restaurantId/menus/:menuId/orders', authMiddleware, controller.createOrder);

//주문 조회
router.get('/orders', authMiddleware, controller.createOrder);

//이메일인증
router.post('/emailcheck', controller.emailAuthentication);

export default router;
