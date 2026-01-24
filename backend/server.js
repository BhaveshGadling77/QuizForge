import authRoutes from './routes/auth.routes.js'
import express from 'express'
import adminRoutes from './routes/adminQuiz.routes.js'
import userRoutes from './routes/user.routes.js' 

const app = express();

app.use(express.json())
app.use(express.urlencoded({extended: true}))


//auth routes
app.use('/api/auth', authRoutes)

//admin routes
app.use('/api/admin/', adminRoutes);


//debugging

console.log("authRoutes:", authRoutes)
console.log("adminRoutes:", adminRoutes)
console.log("userRoutes:", userRoutes)

//user routes
app.use('/users', userRoutes)

app.listen(process.env.PORT, () => {
  console.log("Process is successfully running.")
})