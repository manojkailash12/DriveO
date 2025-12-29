import jwt from "jsonwebtoken";
import { errorHandler } from "./error.js";
import User from "../models/userModel.js";
import { refreshToken } from "../controllers/authController.js";

export const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(errorHandler(401, "Access token required"));
    }

    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return next(errorHandler(401, "Access token required"));
    }

    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN);
    req.user = { id: decoded.id };
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(errorHandler(401, "Token expired. Please sign in again"));
    }
    return next(errorHandler(403, "Invalid token"));
  }
};
