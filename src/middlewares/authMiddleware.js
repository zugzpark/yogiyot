import jwt from 'jsonwebtoken';
import CustomError from '../utils/error/CustomError.js';

export default async function (req, res, next) {
  try {
  
    const cookies = req.cookies[process.env.JWT_AUTH];
  
    if (!cookies) throw new CustomError("AccessError",401,'로그인이 필요한 서비스입니다')

      //토큰 확인
      const [tokenType, tokenValue] = cookies.split(' ');

      const { userId, id, userType, point } = jwt.verify(tokenValue, process.env.JWT_SECRET_KEY);

      req.user = { userId, id, userType, point };

      next();
   } catch (error) {
      next(error);
   }
}
