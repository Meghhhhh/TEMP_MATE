import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if (typeof token === 'object') {
            token = JSON.stringify(token);  
          }

        if (!token) {
            const authHeader = req.header('Authorization');
            
            if (authHeader && authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }
  
        if (!token) {
            throw new ApiError(401, "Unauthorized request - No token provided");
        }
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
