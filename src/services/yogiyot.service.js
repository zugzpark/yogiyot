import { yogiyotRepository } from "../repositories/yogiyot.repository.js";
import CustomError from "../utils/error/CustomError.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


export class yogiyotService {
  repository = new yogiyotRepository();

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
  createRestaurant = async (
    brandName,
    address,
    tel,
    type,
    userId,
    userType
  ) => {
    if (userType !== "owner") {
      return res
        .status(401)
        .json({ errorMessage: "사장님만 사용할 수 있는 api입니다" });
    }
    const restaurant = await this.repository.createRestaurant(
      brandName,
      address,
      tel,
      type,
      userId
    );
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
  updateRestaurant = async (
    brandName,
    address,
    tel,
    type,
    userType,
    restaurantId
  ) => {
    if (userType !== "owner") {
      return res
        .status(401)
        .json({ errorMessage: "사장님만 사용할 수 있는 api입니다" });
    }
    const restaurant = await this.repository.findByRestaurantId(restaurantId);
    if (!restaurant || restaurant.deletedAt !== null) {
      return res
        .status(404)
        .json({ errorMessage: "존재하지 않는 사업장 입니다" });
    }

    await this.repository.updateRestaurant(
      brandName,
      address,
      tel,
      type,
      restaurantId
    );

    //변경된 데이터 response
    const updatedRestaurant = await this.repository.findByRestaurantId(
      restaurantId
    );

    return updatedRestaurant;
  };

  // 사업장삭제
  deleteRestaurant = async (restaurantId, userType) => {
    if (userType !== "owner") {
      return res
        .status(401)
        .json({ errorMessage: "사장님만 사용할 수 있는 api입니다" });
    }
    const restaurant = await this.repository.findByRestaurantId(restaurantId);
    if (!restaurant || restaurant.deletedAt !== null) {
      return res
        .status(404)
        .json({ errorMessage: "존재하지 않는 사업장 입니다" });
    }
    await this.repository.softDeleteRestaurant(restaurantId);

    //삭제될 정보 전달
    return restaurant;
  };

  /**
   * 모든 음식점 조회 service
   * @return {object}
   */
  findAllRestaurants = async () => {
    const restaurants = this.repository.findAllRestaurants();

    return restaurants;
  };

  /** 회원가입 service
   *
   * @param {*} id
   * @param {*} password
   * @param {*} userType
   */
  createUser = async (id, password, userType) => {
    let point;
    userType === "CUSTOMER" ? (point = 1000000) : (point = 0);
    password = await bcrypt.hash(password, 10);
    
    await this.repository.createUser(id, password, userType, point)
    
  };

  /** 로그인 service
   *
   * @param {*} id
   * @param {*} password
   * @return {object}
   */
  login = async (id, password) => {
    //아이디 비밀번호 조회

    const user = await this.repository.findUser(id, password);

    //아이디 검증
    if (user.length == 0)
      throw new CustomError("NotExist", 401, "존재하지 않는 닉네임 입니다.");

    //비밀번호 검증
    if (!(await bcrypt.compare(password, user[0].password)))
      throw new CustomError(
        "passwordNotMatch",
        401,
        "비밀번호가 일치하지않습니다."
      );

    //쿠키 설정
    let expires = new Date();
    expires.setMinutes(expires.getMinutes() + 30);
    const token = jwt.sign(
      {
        userId: user[0].userId,
        id: user[0].id,
        userType: user[0].userType,
        point: user[0].point,
      },
      process.env.JWT_SECRET_KEY
    );

    return { token, expires };
  };

  /** 메뉴등록 service
   *
   * @param {*} restaurantId
   * @param {*} menuName
   * @param {*} image
   * @param {*} price
   * @param {*} type
   */
  createMenu = async (restaurantId, menuName, image, price, type) => {
    //음식점 검증
    const restaurant = await this.repository.findRestaurant(restaurantId);
    
    
    //메뉴이름 검증
    const findMenuName = await this.repository.findMenuByName(menuName);
    
    //에러 리턴
    if (!restaurant)
      throw new CustomError("BadRequest", 404, "존재하지 않는 업장 입니다");
    if (findMenuName)
      throw new CustomError("ExistError", 409, "중복된 메뉴 이름입니다.");

    //메뉴 생성
    
    await this.repository.createMenu(restaurantId, menuName, image, price, type)
    
  };

  /** menuId로 메뉴조회 service
   *
   * @param {*} restaurantId
   * @param {*} menuId
   * @return {object}
   */
  findRestaurantMenu = async (restaurantId, menuId) => {
    const menu = await this.repository.findMenuById(restaurantId, menuId);

    if (!menu)
      throw new CustomError("BadRequest", 404, "존재하지 않는 메뉴 입니다");

    return menu;
  };

  /** 주문등록
   *
   * @param {*} userId
   * @param {*} customerId
   * @param {*} restaurantId
   * @param {*} menuId
   * @param {*} foodPrice
   */
  createOrder = async (userId, customerId, restaurantId, menuId, foodPrice,userPoint) => {
    
    await this.repository.updateUser(
      userId,
      userPoint,
      foodPrice
    ),
    
    await this.repository.createOrder(
      userId,
      customerId,
      restaurantId,
      menuId,
      foodPrice
    );

  };

  /** restaurantId로 음식점 조회 service
   *
   * @param {Number} restaurantId
   * @return {object}
   */
  findRestaurant = async (restaurantId) => {
    const restaurant = this.repository.findRestaurant(restaurantId);

    if (!restaurant)
      throw new CustomError("BadRequest", 404, "존재하지 않는 업장 입니다");

    return restaurant;
  };

  /** restaurantId로 UserId 찾기
   *
   * @param {*} restaurantId
   * @returns
   */
  findUserIdByRestaurant = async (restaurantId) => {
    const userId = await this.repository.findUserIdByRestaurant(restaurantId);
    if (!userId)
      throw new CustomError("BadRequest", 404, "존재하지 않는 업장 입니다");

    return userId;
  };

  /** userId로 주문 조회 CUSTOMER
   * 
   * @param {*} userId 
   * @returns 
   */
  getOrders = async (userId) => {
    const orders = await this.repository.getOrders(userId)

    return orders
  }

  /** userId로 주문 조회 OWNER
   * 
   * @param {*} userId 
   * @returns 
   */
  getOrdersByOwer = async(userId) => {
    const orders = await this.repository.getOrdersByOwner(userId)

    return orders
  }
}
