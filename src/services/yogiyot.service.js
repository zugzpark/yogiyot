import { yogiyotRepository } from '../repositories/yogiyot.repository.js';

export class yogiyotService {
   repository = new yogiyotRepository();

   /**
    * https://teamsparta.notion.site/5-6-Layered-Architecture-Pattern-Repository-1950d4b356d64f20b2c03b1f898f944c
    * service.js 참고
    */

   //검색
   getSuggestions = async (input) => {
      const search = await this.repository.getSuggestions(input);
      return search;
   };

   findAllRestaurantsWithoutDel = async () => {
      const restaurants = await this.repository.findAllRestaurantsWithoutDel();
      return restaurants;
   };

   // 사업장등록
   createRestaurant = async (brandName, address, tel, type, userId, userType) => {
      if (userType !== 'owner') {
         return res.status(401).json({ errorMessage: '사장님만 사용할 수 있는 api입니다' });
      }
      const restaurant = await this.repository.createRestaurant(brandName, address, tel, type, userId);
      return {
         restaurantId: restaurant.restaurantId,
         brandName: restaurant.brandName,
         address: restaurant.address,
         tel: restaurant.tel,
         type: restaurant.type,
         createdAt: restaurant.createdAt,
      };
   };

   // 사업장수정
   updateRestaurant = async (brandName, address, tel, type, userType, restaurantId) => {
      if (userType !== 'owner') {
         return res.status(401).json({ errorMessage: '사장님만 사용할 수 있는 api입니다' });
      }
      const restaurant = await this.repository.findByRestaurantId(restaurantId);
      if (!restaurant || restaurant.deletedAt !== null) {
         return res.status(404).json({ errorMessage: '존재하지 않는 사업장 입니다' });
      }

      await this.repository.updateRestaurant(brandName, address, tel, type, restaurantId);

      //변경된 데이터 response
      const updatedRestaurant = await this.repository.findByRestaurantId(restaurantId);

      return updatedRestaurant;
   };

   // 사업장삭제
   deleteRestaurant = async (restaurantId, userType) => {
      if (userType !== 'owner') {
         return res.status(401).json({ errorMessage: '사장님만 사용할 수 있는 api입니다' });
      }
      const restaurant = await this.repository.findByRestaurantId(restaurantId);
      if (!restaurant || restaurant.deletedAt !== null) {
         return res.status(404).json({ errorMessage: '존재하지 않는 사업장 입니다' });
      }
      await this.repository.softDeleteRestaurant(restaurantId);

      //삭제될 정보 전달
      return restaurant;
   };
}
