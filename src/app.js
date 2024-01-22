import express from 'express';
import router from './routes/yogiyot.router.js';
import { yogiyotRepository } from './repositories/yogiyot.repository.js';
import ErrorHandler from "./middlewares/errorHandlerMiddleware.js";
import cookieParser from 'cookie-parser'
import path from 'path'
const elasticsearch = new yogiyotRepository();

const app = express();
const PORT = 3000;

const __dirname = path.resolve();

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'))

app.use("/yogiyot", router)
app.get("/", (req, res) => {
  
   res.sendFile(path.join(__dirname, '../public/index.html'));
 });

 elasticsearch
 .init()
 .then(() => {
    app.listen(PORT, () => {
       console.log(`${PORT} success`);
    });
 })
 .catch(console.error);

app.listen(PORT, () => {
  console.log(PORT, `success`);
});

app.use(ErrorHandler)