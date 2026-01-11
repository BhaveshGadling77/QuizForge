import { jwt } from 'jsonwebtoken'
export function authenticateToken(token) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) return res.sendStatus(401);
  
}
