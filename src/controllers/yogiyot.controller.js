import { yogiyotService } from "../services/yogiyot.service.js";
import CustomError from "../utils/error/CustomError.js";
import menusValidator from "../utils/validation/menusValidator.js";
import usersValidator from "../utils/validation/usersValidator.js";
import { imageUploader, uploadWebImage } from "../utils/aws/imageUploader.js";
import server from 'http'
import { Server } from "socket.io";
const io = new Server(server);


export class yogiyotController {
  service = new yogiyotService();

  /** 음식점 목록 controller
   * 
   */
  getRestaurants = async (req, res, next) => {
    try {
      const restaurants = await this.service.findAllRestaurants();
  
      return res.status(200).json({ data: restaurants });
    } catch (error) {
      next(error);
    }
  };

  /** 회원가입 controller
   * 
   */
  signUp = async (req, res, next) => {
    try {
      
      const validation = usersValidator(req.body);
      if (validation.error)
        throw new CustomError(
          "ValidationError",
          400,
          "데이터 형식이 올바르지 않습니다"
        );

      const { id, password, userType } = validation.value;

      await this.service.createUser(id, password, userType);

      return res.status(200).json({ message: "회원가입이 완료되었습니다" });
    } catch (error) {
      next(error);
    }
  };

  /** 로그인 controller
   * 
   */
  login = async (req, res, next) => {
    try {
      

      const validation = usersValidator(req.body);
      
      if (validation.error)
        throw new CustomError(
          "ValidationError",
          400,
          "데이터 형식이 올바르지 않습니다"
        );

      const { id, password } = validation.value;

      const login = await this.service.login(id, password);
      
      if (login) {
        res.cookie(process.env.JWT_AUTH, `Bearer ${login.token}`, {
          expires: login.expires,
        });
      }
      return res.status(200).json({ message: "로그인이 완료되었습니다" });
    } catch (error) {
      next(error);
    }
  };

  /** 메뉴 생성 controller
   * 
   */
  createMenu = async (req, res, next) => {
    try {
      const { restaurantId } = req.params;

      //파일 이름 image로 지정
      req.body.image = req.file.filename;

      //유효성 검증
      const validation = menusValidator(req.body);
      const { menuName, price, image, type } = validation.value;

      // //유효성 에러 리턴
      if (validation.error)
        throw new CustomError(
          "ValidationError",
          400,
          "데이터 형식이 올바르지 않습니다"
        );

      //서비스 실행
      await this.service.createMenu(restaurantId, menuName, image, price, type);

      //AWS S3 파일 업로드
      imageUploader(req.file);

      return res.status(200).json({ message: "메뉴등록 완료" });
    } catch (error) {
      next(error);
    }
  };

  /** 주문 생성 controller
   * 
   */
  createOrder = async (req, res, next) => {
    try {
      
      if (req.user.userType === "OWNER")
        throw new CustomError("AccessError", 401, "고객님만 사용할수 있습니다");

      //주문시 쿠키에 있는 point 로 메뉴의 price 비교
      

      const { restaurantId, menuId } = req.params;
      

      //음식점 있는지 여부
      await this.service.findRestaurant(restaurantId);

      //음식점에 메뉴가 있는지 여부
      const menu = await this.service.findRestaurantMenu(restaurantId, menuId);

      const userPoint = req.user.point;
      const foodPrice = menu[0].price;
      const userId = req.user.userId;
      const customerId = req.user.id;


      //가격 포인트 비교 트랜잭션 처리 필요
      //if(userPoint-foodPrice>=0)

      //주문 생성
      await this.service.createOrder(
        userId,
        customerId,
        restaurantId,
        menuId,
        foodPrice
      );

      
      const ownerId = await this.service.findUserIdByRestaurant(restaurantId);

      return res.status(200).json({ message: "주문 완료" });
    } catch (error) {
      next(error);
    }
  };
}
