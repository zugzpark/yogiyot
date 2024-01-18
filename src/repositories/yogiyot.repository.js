import { prisma } from '../utils/prisma/index.js';
// const { Client } = require('@elastic/elasticsearch');
import elasticsearch from 'elasticsearch';
// import { Client } from '@elastic/elasticsearch';
const elasticClient = new elasticsearch.Client({
   host: 'localhost:9200',
   log: 'info',
});

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

   //인덱스에 문서 추가
   // addDocument = async () => {
   //    const restaurants = await this.findAllRestaurants();
   //    const menus = await this.findAllMenus();

   //    return elasticClient.index({
   //       index: indexName,
   //       body: {
   //          brandName: restaurants.brandName,
   //          menuName: menus.menuName,
   //          suggest: {
   //             input: document.title.split(' '),
   //          },
   //       },
   //    });
   // };
   // addDocument = async () => {
   //    const restaurants = await this.findAllRestaurants();
   //    const menus = await this.findAllMenus();

   //    return Promise.all(
   //       restaurants.map((restaurant) => {
   //          return Promise.all(
   //             menus.map((menu) => {
   //                return elasticClient.index({
   //                   index: indexName,
   //                   body: {
   //                      brandName: restaurant.name,
   //                      menuName: menu.menuName,
   //                      suggest: {
   //                         input: menu.menuName.split(' '),
   //                      },
   //                   },
   //                });
   //                console.log(response); // 로그로 출력
   //                return response;
   //             })
   //          );
   //       })
   //    );
   // };

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

   //인덱스에 문서 추가
   addDocument = async () => {
      const restaurants = await this.findAllRestaurants();
      const menus = await this.findAllMenus();

      return Promise.all(
         restaurants.map((restaurant) => {
            return Promise.all(
               menus.map(async (menu) => {
                  const response = await elasticClient.index({
                     index: indexName,
                     body: {
                        brandName: restaurant.name,
                        menuName: menu.menuName,
                        suggest: {
                           input: [restaurant.name, ...menu.menuName.split(' ')],
                        },
                     },
                  });
                  console.log(response); // 로그로 출력
                  return response;
               })
            );
         })
      );
   };

   //모든 메뉴 찾기
   findAllMenus = async () => {
      const menus = await prisma.menus.findMany();
      console.log('menusmenusmenus', menus);
      return menus;
   };

   //모든 음식점 찾기
   findAllRestaurants = async () => {
      const restaurants = await prisma.$queryRaw`
    select restaurantId as id,
    brandName as name,
    type
    from Restaurants
    `;

      console.log('restaurantsrestaurantsrestaurants', restaurants);

      return restaurants;
   };
}
