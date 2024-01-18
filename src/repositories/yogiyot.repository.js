import { prisma } from '../utils/prisma/index.js';
// const { Client } = require('@elastic/elasticsearch');
import elasticsearch from 'elasticsearch';
// import { Client } from '@elastic/elasticsearch';
const elasticClient = new elasticsearch.Client({
   host: 'localhost:9200',
   log: 'info',
});

// elasticClient.ping({}, function (error) {
//    if (error) {
//       console.error('Elasticsearch cluster is down!');
//    } else {
//       console.log('Elasticsearch cluster is up!');
//    }
// });

const indexName = 'brand_menu';

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

   //검색조건?..
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

   // 초기 설정
   init = async () => {
      const exists = await this.indexExists();
      if (exists) {
         await this.deleteIndex();
      }

      await this.initIndex();
      await this.initMapping();
      await this.addDocument();
   };

   //document 중복
   checkExistence = async (brandName, menuName) => {
      try {
         console.log(`brandName: ${brandName}, menuName: ${menuName}`);
         const { body } = await elasticClient.search({
            index: indexName,
            body: {
               query: {
                  bool: {
                     must: [{ match: { brandName: brandName } }, { match: { menuName: menuName } }],
                  },
               },
            },
         });

         // Elasticsearch 검색 결과가 없을 때 처리
         if (!body || !body.hits) {
            console.log(`No search results for brandName: ${brandName}, menuName: ${menuName}`);
            return false;
         }
         return body.hits.total.value > 0; // 일치하는 문서가 하나 이상 존재하는지 확인
      } catch (error) {
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
            return Promise.all(
               restaurant.menus.map(async (menu) => {
                  let response;
                  const exists = await this.checkExistence(restaurant.brandName, menu.menuName);
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
                           `Document added successfully for brandName: ${restaurant.name}, menuName: ${menu.menuName}`
                        );
                     } catch (error) {
                        console.error(
                           `Error occurred while adding document for brandName: ${restaurant.name}, menuName: ${menu.menuName}`,
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
         include: {
            menus: true, // 각 음식점의 메뉴 정보를 함께 가져옵니다.
         },
      });

      return restaurants;
   };

   //모든 음식점 찾기
   findAllRestaurants = async () => {
      const restaurants = await prisma.$queryRaw`
    select restaurantId as id,
    brandName as name,
    type
    from Restaurants
    `;

      return restaurants;
   };

   // createRestaurant = async (name, address, tel, type) => {
   //    const createRestaurant = await prisma.restaurants.create({ data: { name, address, tel, type } });
   //    return createRestaurant;
   // };
}
