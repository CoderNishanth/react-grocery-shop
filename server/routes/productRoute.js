import express from "express";
import { addProduct, changeStock, productDetails, productList } from "../controllers/productController.js";
import { upload } from "../configs/multer.js";
import authSeller from "../middlewares/authSeller.js";

const productRouter = express.Router();

productRouter.post("/add",upload.array("images"),authSeller ,addProduct);
productRouter.get("/list",productList);
productRouter.get("/id",productDetails);
productRouter.post("/stock",authSeller, changeStock);

export default productRouter;