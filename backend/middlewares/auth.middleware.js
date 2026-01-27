import  jwt  from 'jsonwebtoken'
import { findById } from '../utils/users.utils.js'

export async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(" ")[1];
  
  // const token = req.cookies.quizforge_token //this is for production only.
  if (!token) return res.sendStatus(401);
  
  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    const v = await findById(decoded) //find the user in the firebase db.
    console.log(v)

    req.user = v;
    //if user dosen't exist.

    if (!req.user) {
      return res.status(403).json({error: "User Not Found"})
    }
    //if everything goes fine then call next()
    console.log(token)
    next()
  } catch(e) {
    console.log(e.message)
    return res.status(403).json({error : e.message})
  }
}
