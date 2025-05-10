import jwt from "jsonwebtoken";


//Middleware for authentication
const authUser = async(req, res, next)=>{
    const {token} = req.cookies;
    if(!token){
        return res.json({
            success: false,
            message: "Unauthorized"
        });
    }
    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if(decoded.id){
            req.body = {...req.body,userId : decoded.id};
        }
        else{
            return res.json({
                success: false,
                message: "Unauthorized"
            });
        }
        next();
    }catch(err){
        return res.json({
            success: false,
            message: err.message
        });
    }
}

export default authUser;