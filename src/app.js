import express from 'express';
import router from './routes/yogiyot.router.js';
import { yogiyotRepository } from './repositories/yogiyot.repository.js';

const elasticsearch = new yogiyotRepository();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/yogiyot', router);
app.get('/', (req, res) => {
   res.send('TEST');
});

//엘라스틱 초기설정
elasticsearch
   .init()
   .then(() => {
      app.listen(PORT, () => {
         console.log(`${PORT} success`);
      });
   })
   .catch(console.error);
