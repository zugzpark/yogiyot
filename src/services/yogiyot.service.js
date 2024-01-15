import { yogiyotRepository } from "../repositories/yogiyot.repository.js";

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
}
