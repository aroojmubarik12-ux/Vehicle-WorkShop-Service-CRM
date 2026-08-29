import jwt from "jsonwebtoken";
import { ENV } from "../config/env";
import { IUser } from "../models/User";

export const generateToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      customerId: user.customerId
    },
    ENV.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
