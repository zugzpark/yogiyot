import express from "express";
import routes from "./routes/index.js"


const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/" , (req,res) => {
  res.send('test')
})

app.listen(PORT, () => {
  console.log(PORT, `success`);
});
