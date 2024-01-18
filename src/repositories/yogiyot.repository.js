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

  //모든 음식점 조회
  findAllRestaurants = async () => {
    const restaurants = await prisma.$queryRaw`
    select restaurantId as id,
    brandName as name,
    type
    from Restaurants
    `;

    return restaurants;
  };

  //음식점 조회
  findRestaurant = async (restaurantId) => {
    const restaurant = await prisma.$queryRaw`
    select restaurantId
    from Restaurants
    where restaurantId = ${restaurantId}`;

    return restaurant.length==0?false:true;
  };

  
  //메뉴 생성
  createMenu = async (restaurantId, menuName, image, price, type) => {
    await prisma.$queryRaw`
    insert into Menus
    (menuName,image,price,type,restaurantId)
    values 
    (${menuName},${image},${price},${type},${restaurantId})`;
  };


  //메뉴 조회
  findMenu = async (menuName) => {
    const result = await prisma.$queryRaw`
    select menuName
    from Menus
    where menuName=${menuName}`

    return result.length==0?false:true
  }

  
  

}
