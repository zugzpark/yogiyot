// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// async function executeTransaction(callback) {
//   let result;

//   try {
//     result = await prisma.$transaction(async (prisma) => {
//       return await callback(prisma);
//     });

//     console.log(`트랜잭션 완료`);
//   } catch (error) {
//     console.log(`실패`,error.message);
//     throw error;
//   } finally {
//     await prisma.$disconnect();
//   }

//   return result;
// }


// export default executeTransaction