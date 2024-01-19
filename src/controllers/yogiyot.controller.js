import { yogiyotService } from '../services/yogiyot.service.js';

// const client = new elasticsearch.Client({ hosts: ['http://localhost:9200'] });

export class yogiyotController {
   service = new yogiyotService();

   //검색
   getSuggestions = async (req, res, next) => {
      try {
         const results = await this.service.getSuggestions(req.params.input);
         return res.status(200).json({ data: results });
      } catch (error) {
         console.error(error);
         next(error);
      }
   };

   /**
    *
    * https://teamsparta.notion.site/5-6-Layered-Architecture-Pattern-Repository-1950d4b356d64f20b2c03b1f898f944c
    * Controller.js 참고
    */

   getRestaurants = async (req, res, next) => {
      try {
         const restaurants = await this.service.findAllRestaurantsWithoutDel();
         return res.status(200).json({ data: restaurants });
      } catch (error) {
         next(error);
      }
   };

   //사업장 등록
   createRestaurant = async (req, res, next) => {
      try {
         // const {userId} = req.user
         const userId = 1; //임시데이터
         const userType = 'owner'; //임시데이터
         const { brandName, address, tel, type } = req.body;
         const restaurant = await this.service.createRestaurant(brandName, address, tel, type, userId, userType);
         return res.status(200).json({ data: restaurant });
      } catch (error) {
         next(error);
      }
   };

   //사업장 수정
   updateRestaurant = async (req, res, next) => {
      try {
         // const { userType } = req.user;
         const userType = 'owner'; //임시데이터
         const { restaurantId } = req.params;
         const { brandName, address, tel, type } = req.body;
         const restaurant = await this.service.updateRestaurant(brandName, address, tel, type, userType, restaurantId);
         return res.status(200).json({ data: restaurant });
      } catch (error) {
         next(error);
      }
   };

   //사업장 삭제
   deleteRestaurant = async (req, res, next) => {
      try {
         // const { userType } = req.user;
         const userType = 'owner'; //임시데이터
         const { restaurantId } = req.params;
         const deletedRestaurant = await this.service.deleteRestaurant(restaurantId, userType);
         return res.status(200).json({ data: deletedRestaurant });
      } catch (error) {
         next(error);
      }
   };
}
