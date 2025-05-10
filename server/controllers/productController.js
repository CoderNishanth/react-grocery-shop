import Product from "../models/Product.js";
import {v2 as cloudinary} from "cloudinary";

//Add Product : /api/product/add
export const addProduct = async(req,res)=>{
    try {
      // Check if productData exists
      let productData = JSON.parse(req.body.productData);
      console.log(productData);
      
      const images = req.files;
      let imagesUrl = await Promise.all(images.map(async (image)=>{
        let result = await cloudinary.uploader.upload(image.path,{resource_type: "image"});
        return result.secure_url;
      }));
      await Product.create({
        ...productData,
        image: imagesUrl
      })
    
      res.json({
        success: true,
        message: "Product added successfully"
      })
    } catch (error) {
      console.log(error.message);
      res.json({
        success: false,
        message: error.message
      });
    }
}

//Get All Products : /api/product/list
export const productList = async(req,res)=>{
    try {
        const products = await Product.find({});
        return res.json({
            success: true,
            message: "Products fetched successfully",
            products
        });
    } catch (error) {
        console.log(error.message);
        res.json({
            success: false,
            message: error.message
        });
    }
}


//Get Single Product : /api/product/id
export const productDetails = async(req,res)=>{
    try {
      const {id} = req.body;
      const product = await Product.findById(id);
      return res.json({
        success: true,
        message: "Product fetched successfully",
        product
      });
    } catch (error) {
      console.log(error.message);
      res.json({
        success: false,
        message: error.message
      });
    }
}


//Change Stock : /api/product/stock
export const changeStock = async(req,res)=>{
    try {
      const {id,inStock} = req.body;
      await Product.findByIdAndUpdate(id,{inStock});
      return res.json({
        success: true,
        message: "Product stock updated successfully"
      });
    } catch (error) {
      console.log(error.message);
      res.json({
        success: false,
        message: error.message
      });
    }
}