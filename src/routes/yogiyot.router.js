import express from 'express';
import { yogiyotController } from '../controllers/yogiyot.controller.js';

const router = express.Router();

const controller = new yogiyotController();

router.get('/', controller.getRestaurants);

//input 요청받은 검색어
router.get('/search/:input', controller.getSuggestions); //검색이랑 목록 url :yogiyot/

export default router;
