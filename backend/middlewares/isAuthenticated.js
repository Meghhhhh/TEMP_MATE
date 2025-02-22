import jwt from "jsonwebtoken";

const isAuthenticated = async (req, res, next) => {
  try {
    let token = req.cookies?.token;

    // If no token in cookies, check the Authorization header
    if (!token) {
      const authHeader = req.header('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7); // Extract token after 'Bearer '
      }
    }

    console.log("Token received:", token);

    // If still no token, return unauthorized
    if (!token) {
      return res.status(401).json({
        message: "No token provided",
        success: false,
      });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);
    if (!decoded) {
      return res.status(401).json({
        message: "Invalid token",
        success: false,
      });
    }

    console.log("Decoded token:", decoded);

    // Attach user ID from the decoded token to request object
    req.id = decoded.userId;

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

export default isAuthenticated;
