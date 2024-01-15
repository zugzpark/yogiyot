import express from 'express';

const router = express.Router();


router.use('/login', Login);
router.use('/signup', SignUp);
router.use('/restaurants',Restaurants);
router.use('/orders',Orders);
router.use('/',BrandSearch)

export default router