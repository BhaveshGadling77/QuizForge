import bcrypt from 'bcrypt'
import { serverTimestamp } from 'firebase/firestore'
import { createUser } from '../utils/users.utils.js'
export async function register(req, res) {
    try {
        const hashPassword = await bcrypt.hash(req.body.password, 10)
        console.log(hashPassword) // for debugging purpose.
        console.log(req.body)
        const user = {
            name : req.body.name,
            role: req.body.role,
            password: hashPassword,
            email : req.body.email,
            updatedAt: serverTimestamp(),
            createdAt: serverTimestamp(),
        }
        const doc = await createUser(user)
        res.send({id : doc.id})

    } catch(e) {
        console.log(e.message)
        res.status(500).send({msg : e.message})
    }
}