import CustomError from '../utils/error/CustomError.js';

const errorHandler = (err, req, res, next) => {
    console.log(`미들웨어 error 처리`)
  if (err instanceof CustomError) {
    return res.status(err.statusCode).json({ message: err.message });
  }
  
  return res.status(500).json({ message: '서버 에러' });
};

export default errorHandler;