import express from 'express'
import { login } from '../controllers/login.js'
import { register } from '../controllers/register.js'
import { logout } from '../controllers/logout.js'

const router = express.Router()

router.post('/login', login)
router.post('/register', register)
router.post('/logout', logout)

export default router;
