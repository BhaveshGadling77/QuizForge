import  jwt  from 'jsonwebtoken'
import { findById } from '../utils/users.utils.js'

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) return res.sendStatus(401);
  
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = await findById(decoded) //find the user in the firebase db.

    //if user dosen't exist.

    if (!req.user) {
      return res.status(401).json({error: "User Not Found"})
    }
    //if everything goes fine then call next()
    
    next()
  } catch(e) {
    console.log(e.message)
    res.sendStatus(403).json({error : e.message})
  }
}
