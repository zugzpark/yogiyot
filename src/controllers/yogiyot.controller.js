import { yogiyotService } from '../services/yogiyot.service.js';

// const client = new elasticsearch.Client({ hosts: ['http://localhost:9200'] });

export class yogiyotController {
   service = new yogiyotService();

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
         const restaurants = await this.service.findAllRestaurants();
         return res.status(200).json({ data: restaurants });
      } catch (error) {
         next(error);
      }
   };
}
