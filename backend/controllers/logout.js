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
