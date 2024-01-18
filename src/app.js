import express from "express";
import router from "./routes/yogiyot.router.js"
import ErrorHandler from "./middlewares/error-handler.middleware.js";

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/yogiyot", router)

app.get("/" , (req,res) => {
  res.send('TEST')
})

app.listen(PORT, () => {
  console.log(PORT, `success`);
});

app.use(ErrorHandler)