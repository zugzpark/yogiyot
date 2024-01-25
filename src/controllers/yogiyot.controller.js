import { yogiyotService } from '../services/yogiyot.service.js';
import { sesMailer } from '../../config/emailAuth.js';

// const client = new elasticsearch.Client({ hosts: ['http://localhost:9200'] });
import CustomError from '../utils/error/CustomError.js';
import menusValidator from '../utils/validation/menusValidator.js';
import usersValidator from '../utils/validation/usersValidator.js';
import { imageUploader, uploadWebImage } from '../utils/aws/imageUploader.js';
import server from 'http';
import { Server } from 'socket.io';
import OwnerError from '../utils/error/OwnerError.js';

const io = new Server(server);

export class yogiyotController {
   service = new yogiyotService();

   //검색
   getSuggestions = async (req, res, next) => {
      try {
         const results = await this.service.getSuggestions(req.params.input);
         return res.status(200).json({ data: results });
      } catch (error) {
         console.error(error);
         next(error);
      }
   };

   //사업장 목록
   getRestaurants = async (req, res, next) => {
      try {
         const restaurants = await this.service.findAllRestaurantsWithoutDel();
         return res.status(200).json({ data: restaurants });
      } catch (error) {
         next(error);
      }
   };

   //사업장 등록
   createRestaurant = async (req, res, next) => {
      try {
         if (req.user.userType !== 'OWNER') throw new OwnerError('AccessError', 401, '사장님만 사용할 수 있습니다');
         const { userId } = req.user;
         const { brandName, address, tel, type } = req.body;
         const restaurant = await this.service.createRestaurant(brandName, address, tel, type, userId, userType);
         return res.status(200).json({ message: '사업장등록 완료' });
      } catch (error) {
         next(error);
      }
   };

   //사업장 수정
   updateRestaurant = async (req, res, next) => {
      try {
         if (req.user.userType !== 'OWNER') throw new OwnerError('AccessError', 401, '사장님만 사용할 수 있습니다');

         const { restaurantId } = req.params;
         const { brandName, address, tel, type } = req.body;
         const restaurant = await this.service.updateRestaurant(brandName, address, tel, type, restaurantId);
         return res.status(200).json({ message: '사업장수정 완료' });
      } catch (error) {
         next(error);
      }
   };

   //사업장 삭제
   deleteRestaurant = async (req, res, next) => {
      try {
         if (req.user.userType !== 'OWNER') throw new OwnerError('AccessError', 401, '사장님만 사용할 수 있습니다');

         const { restaurantId } = req.params;
         const deletedRestaurant = await this.service.deleteRestaurant(restaurantId);
         return res.status(200).json({ message: '사업장삭제 완료' });
      } catch (error) {
         next(error);
      }
   };

   /** 회원가입 controller
    *
    */
   signUp = async (req, res, next) => {
      try {
         const validation = usersValidator(req.body);
         if (validation.error) throw new CustomError('ValidationError', 400, '데이터 형식이 올바르지 않습니다');

         const { id, password, userType } = validation.value;

         await this.service.createUser(id, password, userType);

         return res.status(200).json({ message: '회원가입이 완료되었습니다' });
      } catch (error) {
         next(error);
      }
   };

   /** 로그인 controller
    *
    */
   login = async (req, res, next) => {
      try {
         const validation = usersValidator(req.body);

         if (validation.error) throw new CustomError('ValidationError', 400, '데이터 형식이 올바르지 않습니다');

         const { id, password } = validation.value;

         const login = await this.service.login(id, password);

         if (login) {
            res.cookie(process.env.JWT_AUTH, `Bearer ${login.token}`, {
               expires: login.expires,
            });
         }
         return res.status(200).json({ message: '로그인이 완료되었습니다' });
      } catch (error) {
         next(error);
      }
   };

   /** 메뉴 생성 controller
    *
    */
   createMenu = async (req, res, next) => {
      try {
         if (req.user.userType !== 'OWNER') throw new OwnerError('AccessError', 401, '사장님만 사용할 수 있습니다');
         const { restaurantId } = req.params;

         //파일 이름 image로 지정
         req.body.image = req.file.filename;

         //유효성 검증
         const validation = menusValidator(req.body);
         const { menuName, price, image, type } = validation.value;

         // //유효성 에러 리턴
         if (validation.error) throw new CustomError('ValidationError', 400, '데이터 형식이 올바르지 않습니다');

         //서비스 실행
         await this.service.createMenu(restaurantId, menuName, image, price, type);

         //AWS S3 파일 업로드
         imageUploader(req.file);

         return res.status(200).json({ message: '메뉴등록 완료' });
      } catch (error) {
         next(error);
      }
   };

   /** 주문 생성 controller
    *
    */
   createOrder = async (req, res, next) => {
      try {
         if (req.user.userType === 'OWNER') throw new CustomError('AccessError', 401, '고객님만 사용할수 있습니다');

         //주문시 쿠키에 있는 point 로 메뉴의 price 비교

         const { restaurantId, menuId } = req.params;

         //음식점 있는지 여부
         await this.service.findRestaurant(restaurantId);

         //음식점에 메뉴가 있는지 여부
         const menu = await this.service.findRestaurantMenu(restaurantId, menuId);

         const userPoint = req.user.point;
         const foodPrice = menu[0].price;
         const userId = req.user.userId;
         const customerId = req.user.id;

         //가격 포인트 비교 트랜잭션 처리 필요
         //if(userPoint-foodPrice>=0)

         //주문 생성
         await this.service.createOrder(userId, customerId, restaurantId, menuId, foodPrice);

         const ownerId = await this.service.findUserIdByRestaurant(restaurantId);

         return res.status(200).json({ message: '주문 완료' });
      } catch (error) {
         next(error);
      }
   };

   //이메일인증
   emailAuthentication = async (req, res, next) => {
      try {
         const randomNumber = Math.floor(Math.random() * (999999 - 111111 + 1)) + 111111;
         const { email } = req.body;

         console.log('emailemailemailemail', email);

         const mailOptions = {
            from: `jenna <${process.env.EMAIL}>`, // AWS SES에서 검증된 발신자 이메일 주소.
            to: email,
            subject: '인증 관련 메일입니다.',
            html: '<h1>인증번호를 입력해주세요</h1>' + randomNumber,
         };

         sesMailer.sendMail(mailOptions, (error, responses) => {
            if (error) {
               console.error(error);
               res.status(500).json({
                  message: `Failed to send authentication email to ${email}`,
               });
            } else {
               res.status(200).json({
                  randomNumber,
                  message: `Authentication mail is sent to ${email}`,
               });
            }
            sesMailer.close();
         });
      } catch (error) {
         next(error);
      }
   };
}

//메일에 경고문구가 뜨는데 아마 도메인 설정을 안해서 그런거 같다
