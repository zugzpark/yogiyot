import { prisma } from '../utils/prisma/index.js';
import elasticsearch from 'elasticsearch';
import { client } from '../utils/redis.js';
import { resolve } from 'path';

//elasticsearch
const elasticClient = new elasticsearch.Client({
   host: 'localhost:9200',
   log: 'info',
});

// elastic server 파악
// elasticClient.ping({}, function (error) {
//    if (error) {
//       console.error('Elasticsearch cluster is down!');
//    } else {
//       console.log('Elasticsearch cluster is up!');
//    }
// });

//elasticsearch 내에 생성할 인덱스 이름
const indexName = 'brand_menu';

let result;

export class yogiyotRepository {
   //인덱스 삭제
   deleteIndex = async () => {
      return elasticClient.indices.delete({
         index: indexName,
      });
   };

   //인덱스 생성
   initIndex = async () => {
      return elasticClient.indices.create({
         index: indexName,
      });
   };

   //인덱스 존재여부
   indexExists = async () => {
      return elasticClient.indices.exists({
         index: indexName,
      });
   };

   //인덱스 맵핑
   initMapping = async () => {
      return elasticClient.indices.putMapping({
         index: indexName,
         body: {
            properties: {
               brandName: { type: 'text' },
               menuName: { type: 'text' },
               suggest: {
                  type: 'completion',
                  analyzer: 'simple',
                  search_analyzer: 'simple',
               },
            },
         },
      });
   };

   //검색조건 및 형태?
   getSuggestions = async (input) => {
      return elasticClient.search({
         index: indexName,
         body: {
            suggest: {
               docsuggest: {
                  prefix: input,
                  completion: {
                     field: 'suggest',
                     fuzzy: {
                        fuzziness: 'auto',
                     },
                  },
               },
            },
         },
      });
   };

   // elasticsearch 초기 설정
   init = async () => {
      const exists = await this.indexExists();
      if (exists) {
         await this.deleteIndex();
      }

      await this.initIndex();
      await this.initMapping();
      await this.addDocument();
   };

   //elasticsearch내의 해당 인덱스의 document 중복체크
   checkExistence = async (brandName, menuName) => {
      try {
         // const { body } = await elasticClient.search({
         //    index: indexName,
         //    body: {
         //       query: {
         //          bool: {
         //             must: [{ match: { brandName: brandName } }, { match: { menuName: menuName } }],
         //          },
         //       },
         //    },
         // });

         // must: [{ match: { brandName: brandName } }, { match: { menuName: menuName } }],
         const result = await elasticClient.search({
            index: indexName,
            body: {
               query: {
                  bool: {
                     must: [{ match_phrase: { brandName: brandName } }, { match_phrase: { menuName: menuName } }],
                  },
               },
            },
         });

         console.log('Search result:', result);

         //데이터를 조회 하지 못 했을 때
         if (!result.body || !result.body.hits || !result.body.hits.total) {
            console.log(`No search results for brandName: ${brandName}, menuName: ${menuName}`);
            return false;
         }

         return result.body.hits.total.value > 0; // 일치하는 문서가 하나 이상 존재하는지 확인
      } catch (error) {
         //error가 났을 때 query값이 잘 들어오는지 확인
         console.error(
            `Error occurred in Elasticsearch query for brandName: ${brandName}, menuName: ${menuName}`,
            error
         );
      }
   };

   //인덱스에 문서 추가
   addDocument = async () => {
      const restaurants = await this.findAllRestaurantsWithMenus();

      return Promise.all(
         restaurants.map((restaurant) => {
            // console.log('restaurant.brandName:', restaurant.brandName);
            return Promise.all(
               restaurant.menus.map(async (menu) => {
                  let response;
                  const exists = await this.checkExistence(restaurant.brandName, menu.menuName);

                  //존재하지 않다면
                  if (!exists) {
                     try {
                        response = await elasticClient.index({
                           index: indexName,
                           body: {
                              brandName: restaurant.brandName,
                              menuName: menu.menuName,
                              suggest: {
                                 input: [restaurant.brandName, ...menu.menuName.split(' ')],
                              },
                           },
                        });
                        console.log(
                           `Document added successfully for brandName: ${restaurant.brandName}, menuName: ${menu.menuName}`
                        );
                        // 문서 추가 후 1초 대기
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                     } catch (error) {
                        console.error(
                           `Error occurred while adding document for brandName: ${restaurant.brandName}, menuName: ${menu.menuName}`,
                           error
                        );
                     }
                  }
                  return response;
               })
            );
         })
      );
   };

   //모든 메뉴 찾기(검색할 때 필요)
   findAllMenus = async () => {
      const menus = await prisma.menus.findMany();
      return menus;
   };

   //해당음식점의 메뉴까지 가져오기
   findAllRestaurantsWithMenus = async () => {
      const restaurants = await prisma.restaurants.findMany({
         where: { deletedAt: null },
         include: {
            menus: true, // 각 음식점의 메뉴 정보를 함께 가져옵니다.
         },
      });
      return restaurants;
   };

   //delete된 사업장 제외하고 찾기
   findAllRestaurantsWithoutDel = async () => {
      //본래의 속도를 비교하고 싶으면 주석처리
      await new Promise((resolver) => {
         setTimeout(resolver, 5000);
      });

      const restaurant = await prisma.restaurants.findMany({
         where: { deletedAt: null },
      });
      return restaurant;
   };

   //사업장 생성
   createRestaurant = async (brandName, address, tel, type, userId) => {
      //사업장을 새로 추가할 때마다 캐쉬를 지워준다 (새로 추가한 사업장이 캐쉬에 반영되지 않는 문제로 인한 해결법)
      await client.del('restaurants-list');
      const createRestaurant = await prisma.restaurants.create({
         data: {
            brandName,
            address,
            tel,
            type,
            Users: {
               connect: {
                  userId: userId,
               },
            },
         },
      });
      return createRestaurant;
   };

   //해당 사업장기준 사업장 정보
   findByRestaurantId = async (restaurantId) => {
      const restaurant = await prisma.restaurants.findUnique({ where: { restaurantId: +restaurantId } });
      return restaurant;
   };

   //사업장 주소 찾기
   findByAddress = async (address) => {
      const restaurants = await prisma.restaurants.findMany({ where: { address: address } });
      return restaurants;
   };

   //사업장 수정
   updateRestaurant = async (brandName, address, tel, type, restaurantId) => {
      const restaurant = await prisma.restaurants.update({
         where: {
            restaurantId: +restaurantId,
         },
         data: {
            brandName,
            address,
            tel,
            type,
         },
      });
      return restaurant;
   };

   //사업장 softDelete
   softDeleteRestaurant = async (restaurantId) => {
      await prisma.restaurants.update({ where: { restaurantId: +restaurantId }, data: { deletedAt: new Date() } });
   };

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

   findUserIdByRestaurant = async (restaurantId) => {
      result = await prisma.$queryRaw`
    select UserId
    from Restaurants
    where restaurantId = ${restaurantId}
    and deletedAt IS NULL`;

      return result.length == 0 ? false : result;
   };
}
