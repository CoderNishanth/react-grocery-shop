import "dotenv/config";
import jwt from "jsonwebtoken";
//Login Seller : /api/seller/login
export const sellerLogin = async(req,res)=>{
    try {
    const {email,password} = req.body;
    if(password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL){
        const token = jwt.sign({email},process.env.JWT_SECRET , {expiresIn: "7d"});
    }
    if(password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL){
        const token = jwt.sign({email},process.env.JWT_SECRET , {expiresIn: "7d"});
        res.cookie("sellerToken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", //CSRF protection
            maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
        });

        return res.json({
            success: true,
            message: "Seller logged in successfully",
        });
    }
    else{
        return res.json({
            success: false,
            message: "Invalid Email or Password"
        });
    }
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
}

//check seller auth: /api/seller/is-auth
export const isSellerAuth = async(req,res)=>{
    try{
      return res.json({
        success:true
      })
    }catch(err){
      console.log(err.message);
      res.json({
        success: false,
        message: err.message
      });
    }
}

//Logout Seller : /api/seller/logout

export const logoutSeller = async(req,res)=>{
  try{
    res.clearCookie("sellerToken",{
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", //CSRF protection
    });
    return res.json({
      success:true,
      message: "User logged out successfully"
    })
  }catch(err){
    console.log(err.message);
    res.json({
      success: false,
      message: err.message
    });
  }
}