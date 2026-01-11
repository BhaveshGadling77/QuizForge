import express from 'express'
import bcrypt from 'bcrypt'
import { login } from './routes/login.js'
import { logout } from './routes/logout.js'
import { register } from './routes/register.js'
import { db } from './config/firebase-config.js'
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
} from "firebase/firestore";


const app = express()

//built in middlewares
app.use(express.urlencoded())
app.use(express.json())


//for intial user login and register functionality.
app.post('/login', login)
app.post('/register', register)
app.post('/logout', logout)

app.listen(3000, () => {
    console.log("App is Running on the port 3000")
})