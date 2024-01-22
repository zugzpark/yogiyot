import express from "express";
import router from "./routes/yogiyot.router.js"
import ErrorHandler from "./middlewares/errorHandlerMiddleware.js";
import cookieParser from 'cookie-parser'
import path from 'path'

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

app.listen(PORT, () => {
  console.log(PORT, `success`);
});

app.use(ErrorHandler)