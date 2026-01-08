import { getUserList } from "../utils/users.utils.js"

export function login(req, res) {
    //authenticate the user

    console.log(getUserList())
    const {email, password} = req.body
    
}