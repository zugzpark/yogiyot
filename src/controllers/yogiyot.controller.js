import { yogiyotService } from "../services/yogiyot.service.js";
import menusValidator from "../utils/validation/menusValidator.js";


export class yogiyotController {
  service = new yogiyotService();

  /**
   *
   *
   * https://teamsparta.notion.site/5-6-Layered-Architecture-Pattern-Repository-1950d4b356d64f20b2c03b1f898f944c
   * Controller.js 참고
   */

  //브랜드 목록
  getRestaurants = async (req, res, next) => {
    try {
      const restaurants = await this.service.findAllRestaurants();

      return res.status(200).json({ data: restaurants });
    } catch (error) {
      next(error);
    }
  };

  //메뉴 등록
  createMenu = async (req, res, next) => {
    try {
      console.log('메뉴등록 controller 실행')
      const {restaurantId} = req.params;
      
      const validation = menusValidator(req.body);          
      
      //유효성 검증
      const {menuName,image,price,type} = validation.value
      console.log(`메뉴추가 >> ${restaurantId}`,menuName, image, price, type)
      
      //유효성 에러 리턴
      if (validation.error) throw new CustomError("ValidationError", 400 ,'데이터 형식이 올바르지 않습니다' );

      //서비스 실행
      await this.service.createMenu(restaurantId,menuName,image,price,type);
      
      return res.status(200).json({ message: "메뉴등록 완료" });
    } catch (error) {
      next(error);
    }
  };

 
}
