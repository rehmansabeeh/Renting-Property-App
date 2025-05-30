import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cors from 'cors';
import helemt from 'helmet';
import morgan from 'morgan';

/* Route Import */


/* CONFIGURATIONS*/

dotenv.config();
const app = express();
app.use(express.json());
app.use(helemt());
app.use(helemt.crossOriginResourcePolicy({ policy: 'cross-origin' }));
app.use(morgan('common'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

/* ROUTES */
app.get('/', (req, res) => {
  res.send( 'Welcome to the server!' );
});


/* SERVER */
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});