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
app.get("/test-firestore", async (req, res) => {
  try {
    // ✅ Create / overwrite a document with fixed ID
    await setDoc(doc(db, "test", "check"), {
      ok: true,
      time: Date.now(),
    });

    // ✅ Add a document with auto-generated ID
    const ref = await addDoc(collection(db, "users"), {
      name: "Bhavesh",
      createdAt: Date.now(),
    });

    res.json({
      message: "Firestore write successful ✅",
      docId: ref.id,
    });
  } catch (error) {
    console.error("Firestore Error:", error);
    res.status(500).json({ error: error.message });
  }
});

//for intial user.
app.post('/login', login)
app.post('/register', register)
app.post('/logout', logout)

app.listen(3000, () => {
    console.log("App is Running on the port 3000")
})