import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
    //check if token exist in cookies
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ success: false, message: "Unauthorized - no token provided" });
    }

    try {
        //decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            return res.status(401).json({ success: false, message: "Unauthorized - invalid token" });
        }

        req.userId = decoded.userId;
        //auth success and we run next function
        next();
    } catch (error) {
        //console.log("error in verify auth user", error.message);
        res.status(500).json({ success: false, message: error.message });
    }
}










