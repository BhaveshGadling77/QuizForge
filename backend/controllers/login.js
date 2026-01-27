import { getUserList } from "../utils/users.utils.js";
import { generateAccessToken } from "../services/token.service.js";
import bcrypt from "bcrypt";

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
