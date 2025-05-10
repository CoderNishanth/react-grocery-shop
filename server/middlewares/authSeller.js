import jwt from "jsonwebtoken";


//Middleware for authentication
const authSeller = async(req, res, next)=>{
    const {sellerToken} = req.cookies;
    if(!sellerToken){
        return res.json({
            success: false,
            message: "Unauthorized"
        });
    }
    try{
        const decoded = jwt.verify(sellerToken, process.env.JWT_SECRET);
        if(decoded.email === process.env.SELLER_EMAIL){
            next();
        }
        else{
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }
    }catch(err){
        return res.json({
            success: false,
            message: err.message
        });
    }
}

export default authSeller;