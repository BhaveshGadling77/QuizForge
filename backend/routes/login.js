import { getUserList } from "../utils/users.utils.js";
import bcrpyt from "bcrypt";
export async function login(req, res) {
  try {
    const data = await getUserList();
    const { email, password } = req.body;
    const user = data.find((user) => user.email == email);
    // console.log(user);
    if (!user) {
      return res.status(404).json({ msg: "User Not Found" });
    } else {
      if (await bcrpyt.compare(password, user.password)) {
        return res.json({ msg: "Everything is Ok" });
      } else {
        return res.json({ msg: "Password is Wrong" });
      }
    }
  } catch (e) {
    res.sendStatus(500)
    throw Error ({msg : e.message})
  }
}
