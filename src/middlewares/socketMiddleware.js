// import { server } from "socket.io";
// import CustomError from "../utils/error/CustomError.js"

// const initSocket = (server) => {
//   const io = socket(server);

//   io.on("connection", (socket) => {
//     console.log(`user connected`);
    
//     socket.on("disconnect", () => {
//         console.log(`user disconnected`);
//     })
//   });
// };

// const getIo = () => {
//     if(!io) throw new CustomError("BadRequest",400,'통신 실패')

//     return io
// }

// export {initSocket,getIo}