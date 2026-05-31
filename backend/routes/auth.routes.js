import express from 'express'
import { register, login, logout, googleLogin } from '../controllers/auth.controller.js'

const router = express.Router()

router.post('/login', login)
router.post('/register', register)
router.post('/logout', logout)
router.post("/google", googleLogin);
export default router;
