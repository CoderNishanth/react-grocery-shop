import express from "express";
import { UpdateUserCart } from "../controllers/cartController.js";
import authUser from "../middlewares/authUser.js";


const cartRouter = express.Router();

cartRouter.post("/update",authUser,UpdateUserCart);

export default cartRouter;