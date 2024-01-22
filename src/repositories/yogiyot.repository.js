import { prisma } from "../utils/prisma/index.js";

let result;

export class yogiyotRepository {
  
  /** 회원가입 repository
   * 
   * @param {*} id
   * @param {*} password
   * @param {*} userType
   * @param {*} point
   */
  createUser = async (id, password, userType, point) => {
    result = await prisma.$queryRaw`
    insert into Users
    (id,password,userType,point)
    values
    (${id},${password},${userType},${point})`;
  };

  /** id로 회원조회 repository
   * 
   * @param {*} id
   * @return {object}
   */
  findUser = async (id) => {
    result = await prisma.$queryRaw`
    select userId,id,password,userType,point
    from Users
    where id = ${id}`;

    return result;
  };

  /** 모든 음식점 조회 repository
   * 
   * @return {object}
   */
  findAllRestaurants = async () => {
    result = await prisma.$queryRaw`
    select restaurantId as id,
    brandName as name,
    type
    from Restaurants
    `;

    return result;
  };

  /** restaurantId로 음식점 조회 repository
   * 
   * @param {*} restaurantId
   * @return {boolean}
   */
  findRestaurant = async (restaurantId) => {
    result = await prisma.$queryRaw`
    select restaurantId
    from Restaurants
    where restaurantId = ${restaurantId}`;

    return result.length == 0 ? false : result;
  };


  /** 메뉴 생성 repository
   * 
   * @param {*} restaurantId
   * @param {*} menuName
   * @param {*} image
   * @param {*} price
   * @param {*} type
   */
  createMenu = async (restaurantId, menuName, image, price, type) => {
    await prisma.$queryRaw`
    insert into Menus
    (menuName,image,price,type,restaurantId)
    values 
    (${menuName},${image},${price},${type},${restaurantId})`;
  };


  /** name으로 메뉴 조회 repository
   * 
   * @param {*} menuName
   * @return {boolean}
   */
  findMenuByName = async (menuName) => {
    result = await prisma.$queryRaw`
    select menuName
    from Menus
    where menuName=${menuName}`;

    return result.length == 0 ? false : result;
  };

  /** menuId로 메뉴 조회 repository
   * 
   * @param {*} restaurantId
   * @param {*} menuId
   * @return {object}
   */
  findMenuById = async (restaurantId, menuId) => {
    result = await prisma.$queryRaw`
    select menuId,
    menuName,price
    from Menus
    where restaurantId=${restaurantId}
    and menuId=${menuId}
    and deletedAt IS NULL`;

    return result.length == 0 ? false : result;
  };

  /** 주문생성 repository
   * 
   * @param {*} userId 
   * @param {*} customerId 
   * @param {*} restaurantId 
   * @param {*} menuId 
   * @param {*} foodPrice 
   */
  createOrder = async (userId, customerId, restaurantId, menuId, foodPrice) => {
    await prisma.$queryRaw`
    insert into Orders
    (UserId,customerId,restaurantId,menuId,totalPrice,status)
    values 
    (${userId},${customerId},${restaurantId},${menuId},${foodPrice},"ORDER")`;
  };

  findUserIdByRestaurant = async(restaurantId) => {
    result = await prisma.$queryRaw`
    select UserId
    from Restaurants
    where restaurantId = ${restaurantId}
    and deletedAt IS NULL`
    
    return result.length==0?false:result
  }
}
