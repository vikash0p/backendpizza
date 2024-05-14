import express from 'express'
import { Register, getUser, login, logout, verifyToken } from '../controllers/userController.js';

const route = express.Router();

route.post('/register', Register);
route.post('/login', login);
route.get('/user', verifyToken, getUser);
route.get('/logout', logout);


export default route