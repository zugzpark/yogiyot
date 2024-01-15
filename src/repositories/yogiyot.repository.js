import { prisma } from "../utils/prisma/index.js";

export class yogiyotRepository {
  /**
   * select
   * create
   * update
   * delete
   * 작성 후 리턴
   * https://teamsparta.notion.site/5-6-Layered-Architecture-Pattern-Repository-1950d4b356d64f20b2c03b1f898f944c
   * repository.js 참고
   */

  findAllRestaurants = async() => {
    const restaurants = await prisma.$queryRaw`
    select restaurantId as id,
    brandName as name,
    type
    from Restaurants
    `
    
    return restaurants
  }
}
