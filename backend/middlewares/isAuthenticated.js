import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        let token = req.cookies.token;
        if (typeof token === 'object') {
            token = JSON.stringify(token);  
          }
console.log(token);
        if (!token) {
            const authHeader = req.header('Authorization');
            
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
  console.log(token);
        if (!token) {
            return res.status(401).json({
        message: "No token found",
        success: false,
      });
        }
        console.log(token);
        const decode = jwt.verify(token, process.env.SECRET_KEY);
        if(!decode){
            return res.status(401).json({
                message:"Invalid token",
                success:false
            })
        };
        console.log("DEcoeded token: ", decode)
        req.id = decode.userId;
        next();
    } catch (error) {
        console.log(error);
    }
}
export default isAuthenticated;
