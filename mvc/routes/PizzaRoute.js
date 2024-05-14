import express from 'express';
import { createPizza, getAllPizzas, getPizzaById } from '../controllers/pizzaController.js';

const route = express.Router();

route.post('/create',createPizza);
route.get('/all', getAllPizzas);
route.get('/all/:id', getPizzaById);

export default route;