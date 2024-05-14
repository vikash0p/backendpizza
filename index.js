import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bodyParser from 'body-parser'
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongodbConnection from './utils/mongodbConnection.js';
import userRoute from './mvc/routes/userRoute.js';
import pizzaRoute from './mvc/routes/PizzaRoute.js'

dotenv.config();

mongodbConnection();
const app = express()
const port = process.env.PORT || 5000
app.use(cors({
    origin: 'https://frontendpizza.vercel.app',
    credentials: true,


}));
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json());
app.use(morgan('dev'));
app.use(cookieParser());
app.use('/auth', userRoute);
app.use('/pizza', pizzaRoute)

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`pizza app listening on port ${port}`)
})