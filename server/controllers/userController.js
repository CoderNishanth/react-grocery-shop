import jwt from "jsonwebtoken";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import "dotenv/config";
// import coo

//Register User : /api/user/register
export const registerUser = async (req, res) => {
    
    try {
      const { name, email, password } = req.body;
      if(!name || !email || !password){
        return res.json({
          success: false,
          message: "All fields are required",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.json({
          success: false,
          message: "User already exists",
        }); 
      }

      const hashedpass = await bcrypt.hash(password, 10);
      const user = await User.create({
        name,
        email,
        password: hashedpass,
      });

      const token = jwt.sign({
        id: user._id,
      }, process.env.JWT_SECRET, { expiresIn: "7d" });
      

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", //CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
      });

    return res.json({
      success: true,
      message: "User registered successfully",
      user : {email: user.email, name: user.name}
    });
    } catch (error) {
        console.log(error.message);
        res.json({
        success: false,
        message: error.message,
    });
  }
};


//Login User : /api/user/login
export const loginUser = async (req, res) => {
  try
  {  const { email, password } = req.body;
    if (!email || !password) {
      return res.json({
        success: false,
        message: "Email and password are required",
      });
    }
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.json({
        success: false,
        message: "Invalid Email or Password"
      });
    }

    const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordMatch) {
      return res.json({
        success: false,
        message: "Invalid Email or Password"
      });
    }
    const token = jwt.sign({
      id: existingUser._id,
    }, process.env.JWT_SECRET, { expiresIn: "7d" });
    

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict", //CSRF protection
      maxAge: 7 * 24 * 60 * 60 * 1000, //7 days
    });

  return res.json({
    success: true,
    message: "User logged in successfully",
    user : {email: existingUser.email, name: existingUser.name}
  });
  }
  catch(error){
    console.log(error.message);
    res.json({
      success: false,
      message: error.message
    });
  }
}

//check auth: /api/user/is-auth
export const isAuth = async(req,res)=>{
    try{
      const {userId} = req.body;
      const user = await User.findById(userId).select("-password");
      return res.json({
        success:true,
        user
      })
    }catch(err){
      console.log(err.message);
      res.json({
        success: false,
        message: err.message
      });
    }
}

//Logout User : /api/user/logout

export const logoutUser = async(req,res)=>{
  try{
    res.clearCookie("token",{
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