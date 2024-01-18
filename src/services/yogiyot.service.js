import { yogiyotRepository } from '../repositories/yogiyot.repository.js';

export class yogiyotService {
   repository = new yogiyotRepository();

   /**
    * https://teamsparta.notion.site/5-6-Layered-Architecture-Pattern-Repository-1950d4b356d64f20b2c03b1f898f944c
    * service.js 참고
    */

   // export function getSuggestions(input) {
   //    // 1. 사용자의 입력을 검증하고 변환
   //    const validatedInput = validateAndTransformInput(input);

   //    // 2. Elasticsearch에 쿼리를 보내고 결과를 받음
   //    return elasticsearchRepository.getSuggestions(validatedInput)
   //       .then((result) => {
   //          // 3. 검색 결과를 후처리
   //          return postprocessResults(result);
   //       });
   getSuggestions = async (input) => {
      const search = await this.repository.getSuggestions(input);
      return search;
   };

   findAllRestaurants = async () => {
      const restaurants = await this.repository.findAllRestaurants();
      return restaurants;
   };
}
