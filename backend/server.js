import express from 'express'
import bcrypt from 'bcrypt'
import { login } from './routes/login'
import { logout } from './routes/logout'
import { register } from './routes/register'

const app = express()

//built in middlewares
app.use(express.urlencoded())
app.use(express.json())

//for intial user.
app.post('/login', login)
app.post('/register', register)
app.post('/logout', logout)

app.listen(3000, () => {
    console.log("App is Running on the port 3000")
})