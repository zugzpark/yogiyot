import express from 'express';
import { yogiyotController } from '../controllers/yogiyot.controller.js';

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

//이메일인증
router.post('/emailcheck', controller.emailAuthentication);

export default router;
