import jwt from "jsonwebtoken";

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15d",
  });
};

export function decodeToken(token) {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
}