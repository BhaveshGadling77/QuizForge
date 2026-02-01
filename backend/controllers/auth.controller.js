import { getUserList, createUser } from "../utils/users.utils.js";
import { serverTimestamp } from 'firebase/firestore'
import { generateAccessToken } from "../services/token.service.js";
import bcrypt from "bcrypt";

//register controller
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

//login controller
export async function login(req, res) {
  try {
    const data = await getUserList();
    const { email, password } = req.body;

    // if Missing credentials
    if (!email || !password) {
      return res.status(400).json({ msg: "Missing credentials" });
    }

    // Find user
    const user = data.find((u) => u.email === email);

    if (!user) {
      return res.status(404).json({ msg: "User not found" });
    }

    // Password check
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ msg: "Incorrect password" });
    }

    // Generate token
    const { id, role, name } = user;
    const token = generateAccessToken({ id, role, name, email });

    // Set cookie
    res.cookie("quizforge_token", token, {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ msg: "Login successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ msg: "Internal Server Error" });
  }
}

// logout controller
export async function logout(req, res) {
  try {
    res.clearCookie("quizforge_token", {
      httpOnly: true,
      sameSite: "lax",
      secure: false, // true in production
    });
    
    return res.status(200).json({
      msg: "Logout successful",
    });
  } catch (e) {
    console.error("Logout Error:", e);
    return res.status(500).json({
      msg: "Internal Server Error",
    });
  }
}
