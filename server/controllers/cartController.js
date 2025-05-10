

//Update User CartData : /api/cart/update

import User from "../models/User.js";

export const UpdateUserCart = async(req,res)=>{
    try {
      const {userId} = req.body;
      const {cartItems} = req.body;
      const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Update the user's cartItems field
    user.cartItems = cartItems;
    // Save the updated user document
    await user.save();
      return res.json({
        success: true,
        message: "Cart updated successfully",
      });
    } catch (error) {
      console.log(error.message);
      res.json({
        success: false,
        message: error.message
      });
    }
}