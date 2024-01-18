import { yogiyotRepository } from "../repositories/yogiyot.repository.js";
import CustomError from '../utils/error/CustomError.js'

export class yogiyotService {
  repository = new yogiyotRepository();

  /**
   * https://teamsparta.notion.site/5-6-Layered-Architecture-Pattern-Repository-1950d4b356d64f20b2c03b1f898f944c
   * service.js 참고
   */
  findAllRestaurants = async () => {
    const restaurants = await this.repository.findAllRestaurants();
    
    return restaurants
   
  };

  //메뉴 등록
  createMenu = async (restaurantId, menuName, image, price,type) => {
      console.log(`service 실행`)
      
      //음식점 검증
      const restaurant = await this.repository.findRestaurant(restaurantId)

      //메뉴이름 검증
      const findMenuName = await this.repository.findMenu(menuName)

      //에러 리턴
      if(!restaurant) throw new CustomError("BadRequest", 404 ,"존재하지 않는 업장 입니다");
      if(findMenuName) throw new CustomError("ExistError",409,"중복된 메뉴 이름입니다.")
    
      await this.repository.createMenu(restaurantId, menuName, image, price,type)

      return result
  }


}
