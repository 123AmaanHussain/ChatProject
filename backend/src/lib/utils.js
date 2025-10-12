import jwt from "jsonwebtoken"

export const generateToken = (userId,res) => {
    const token = jwt.sign({userId:userId},process.env.JWT_SECRET,{
        expiresIn:"7d"
    });
    res.cookie("jwt", token, {
        httpOnly: true,  //prevents XSS attacks: cross-site scripting
        secure: true,    //only sends cookies over HTTPS
        sameSite: process.env.NODE_ENV === "development"?false:true, //prevents CSRF attacks
        maxAge: 7 * 24 * 60 * 60 * 1000  //milliseconds of 7 days
    });    
    return token;
}