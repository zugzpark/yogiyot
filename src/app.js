import express from "express";
import router from "./routes/yogiyot.router.js"


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
