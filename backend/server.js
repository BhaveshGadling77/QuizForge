import authRoutes from './routes/auth.routes.js'
import express from 'express'
import adminRoutes from './routes/adminQuiz.routes.js'
import userRoutes from './routes/user.routes.js' 
import cookieParser from 'cookie-parser';

const app = express();

//built-in middlewares

app.use(express.json())
app.use(express.urlencoded({extended: true}))
app.use(cookieParser())


//auth routes
app.use('/api/auth', authRoutes)

//admin routes
app.use('/api/admin/', adminRoutes);


//debugging

// console.log("authRoutes:", authRoutes)
// console.log("adminRoutes:", adminRoutes)
// console.log("userRoutes:", userRoutes)

//user routes
app.use('/users', userRoutes)

app.listen(process.env.PORT, () => {
  console.log(`Server is successfully running on Port ${process.env.PORT}`)
})