import { getUserList } from "../utils/users.utils.js";
import { generateAccessToken } from "../services/token.service.js";
import bcrpyt from "bcrypt";

export async function login(req, res) {
  try {
    const data = await getUserList();
    const { email, password } = req.body;
    //if email or password doesn't exist in the body.
    if (!email || !password) {
      return res.status(400).json({ msg: "Missing credentials" });
    }
    const user = data.find((user) => user.email == email);
    // console.log(user);
    const { id, role, name } = user;
    //if user doesn't exist.
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    }
    //password checking 
    if (await bcrpyt.compare(password, user.password)) {
      const token = generateAccessToken({ id, role, name, email });
      return res.json({ token });
    }
    return res.json({ msg: "Password is Wrong" });
  } catch (e) {
    res.sendStatus(500);
    throw Error({ msg: e.message });
  }
}
