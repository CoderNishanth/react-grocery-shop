import express from "express";
import { getAllOrders, getOrdersByUserId, placeOrderCOD, placeOrderStripe } from "../controllers/OrderController.js";
import authUser from "../middlewares/authUser.js";
import authSeller from "../middlewares/authSeller.js";

const orderRoute = express.Router();

orderRoute.post("/cod",authUser,placeOrderCOD);
orderRoute.post("/stripe",authUser,placeOrderStripe);
orderRoute.get("/user",authUser,getOrdersByUserId);
orderRoute.get("/seller",authSeller,getAllOrders);

export default orderRoute;
